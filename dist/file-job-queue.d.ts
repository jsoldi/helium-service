import { JobQueue } from "./assigner";
import { Cast } from "to-typed";
export declare class FileJobQueue<T> implements JobQueue<T> {
    private readonly file;
    constructor(path: string, itemCast: Cast<T>);
    enqueue(task: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
}
interface MonitorJob<T> {
    id: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    task: T;
}
export declare class FileJobMonitor<T> implements JobQueue<T> {
    private readonly file;
    constructor(path: string, itemCast: Cast<T>);
    private getNextId;
    enqueue(task: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
    complete(taskId: number, status?: 'completed' | 'failed'): Promise<void>;
    read(): Promise<MonitorJob<T>[]>;
}
export {};
