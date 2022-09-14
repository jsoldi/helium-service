import { JobQueue } from "./assigner";
import { Cast } from "to-typed";
export declare class FileJobQueue<T> implements JobQueue<T, void> {
    private readonly file;
    constructor(path: string, itemCast: Cast<T>);
    enqueue(task: T): Promise<void>;
    dequeue(): Promise<{
        id: void;
        task: T;
    } | undefined>;
}
interface MonitorJob<T, R> {
    id: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: string | R;
    task: T;
}
export declare class FileJobMonitor<T, R> implements JobQueue<T, number> {
    private readonly file;
    constructor(path: string, itemCast: Cast<T>, resultCast: Cast<R>);
    private getNextId;
    enqueue(task: T): Promise<number>;
    dequeue(): Promise<{
        id: number;
        task: T;
    } | undefined>;
    private finalize;
    complete(taskId: number, result: R): Promise<void>;
    fail(taskId: number, result: string): Promise<void>;
    read(): Promise<MonitorJob<T, R>[]>;
}
export {};
