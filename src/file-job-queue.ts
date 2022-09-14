import { JobQueue } from "./assigner";
import fs from 'fs';
import { Cast, Maybe } from "to-typed";
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

interface MonitorJob<T> {
    id: number
    status: 'pending' | 'running' | 'completed' | 'failed'
    task: T
}

export class FileJobMonitor<T> implements JobQueue<T> {
    private readonly file: TypedJsonFile<MonitorJob<T>[]>

    constructor(path: string, itemCast: Cast<T>) {
        this.file = new TypedJsonFile<MonitorJob<T>[]>(path, Cast.asArrayOf(Cast.as({
            id: Cast.asNumber,
            status: Cast.asEnum('pending', 'running', 'completed', 'failed'),
            task: itemCast
        })).else([]));
    }

    private getNextId(data: MonitorJob<T>[]): number {
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

    async complete(taskId: number, status: 'completed' | 'failed' = 'completed'): Promise<void> {
        await this.file.update(data => {
            const job = data.find(job => job.id === taskId);

            if (job)
                job.status = status;

            return data;
        })
    }

    async read(): Promise<MonitorJob<T>[]> {
        return await this.file.read();
    }
}
