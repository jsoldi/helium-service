import { Maybe } from "to-typed";
export interface JobQueue<T> {
    enqueue(task: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
}
export declare class Assigner<T> {
    private readonly jobs;
    private updateRequired;
    private readonly tasks;
    constructor(jobs: JobQueue<T>);
    private updateLoop;
    private static delay;
    addJob(job: T): Promise<void>;
    doWork(timeout: number): Promise<Maybe<T>>;
}
