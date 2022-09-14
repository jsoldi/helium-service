import { Cast } from "to-typed";
import { TypedJsonFile } from 'json-to-typed';
export class FileJobQueue {
    constructor(path, itemCast) {
        this.file = new TypedJsonFile(path, Cast.asArrayOf(itemCast).else([]));
    }
    async enqueue(task) {
        await this.file.update(data => {
            data.push(task);
            return data;
        });
    }
    async dequeue() {
        return await this.file.use(async (file) => {
            const data = await file.read();
            if (data.length) {
                const job = data.shift();
                await file.write(data);
                return job;
            }
        });
    }
}
export class FileJobMonitor {
    constructor(path, itemCast) {
        this.file = new TypedJsonFile(path, Cast.asArrayOf(Cast.as({
            id: Cast.asNumber,
            status: Cast.asEnum('pending', 'running', 'completed', 'failed'),
            task: itemCast
        })).else([]));
    }
    getNextId(data) {
        return Math.max(0, ...data.map(job => job.id)) + 1;
    }
    async enqueue(task) {
        await this.file.update(data => {
            const id = this.getNextId(data);
            data.push({ id, status: 'pending', task });
            return data;
        });
    }
    async dequeue() {
        return await this.file.use(async (file) => {
            const data = await file.read();
            if (data.length) {
                const job = data.find(job => job.status === 'pending');
                if (job) {
                    job.status = 'running';
                    await file.write(data);
                    return job.task;
                }
            }
        });
    }
    async complete(taskId, status = 'completed') {
        await this.file.update(data => {
            const job = data.find(job => job.id === taskId);
            if (job)
                job.status = status;
            return data;
        });
    }
    async read() {
        return await this.file.read();
    }
}
