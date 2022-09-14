import { JobQueue } from "./assigner";
import fs from 'fs';
import { Cast, Guard, Maybe } from "to-typed";
import { TypedJsonFile } from 'json-to-typed'

export class FileJobQueue<T> implements JobQueue<T> {
    private readonly file: TypedJsonFile<T[]>

    constructor(path: string, itemCast: Cast<T>) { 
        this.file = new  TypedJsonFile<T[]>(path, Cast.asArrayOf(itemCast).else([]));
    }

    async enqueue(task: T): Promise<void> {
        await this.file.update(data => {
            data.push(task);
            return data;
        })
    }

    async dequeue(): Promise<T | undefined> {
        return await this.file.use(async file => {
            const data = await file.read();

            if (data.length) {
                const job = data.shift();
                await file.write(data);
                return job;
            }
        })
    }
}

interface MonitorJob<T, R> {
    id: number
    status: 'pending' | 'running' | 'completed' | 'failed'
    result?: string | R,
    task: T
}

export class FileJobMonitor<T, R> implements JobQueue<T> {
    private readonly file: TypedJsonFile<MonitorJob<T, R>[]>

    constructor(path: string, itemCast: Cast<T>, resultCast: Cast<R>) {
        this.file = new TypedJsonFile<MonitorJob<T, R>[]>(path, Cast.asArrayOf(Cast.as({
            id: Cast.asNumber,
            result: Guard.isConst(undefined).or(Guard.isString).or(resultCast),
            status: Cast.asEnum('pending', 'running', 'completed', 'failed'),
            task: itemCast
        })).else([]));
    }

    private getNextId(data: MonitorJob<T, R>[]): number {
        return Math.max(0, ...data.map(job => job.id)) + 1;
    }

    async enqueue(task: T): Promise<void> {
        await this.file.update(data => {
            const id = this.getNextId(data);
            data.push({ id, status: 'pending', task });
            return data;
        })
    }

    async dequeue(): Promise<T | undefined> {
        return await this.file.use(async file => {
            const data = await file.read();

            if (data.length) {
                const job = data.find(job => job.status === 'pending');

                if (job) {
                    job.status = 'running';
                    await file.write(data);
                    return job.task;
                }
            }
        })
    }

    private async finalize(taskId: number, status: 'completed' | 'failed', result?: string | R): Promise<void> {
        await this.file.update(data => {
            const job = data.find(job => job.id === taskId);

            if (job) {
                job.status = status;
                job.result = result;
            }

            return data;
        })
    }

    async complete(taskId: number, result: R): Promise<void> {
        await this.finalize(taskId, 'completed', result);
    }

    async fail(taskId: number, result: string): Promise<void> {
        await this.finalize(taskId, 'failed', result);
    }

    async read(): Promise<MonitorJob<T, R>[]> {
        return await this.file.read();
    }
}
