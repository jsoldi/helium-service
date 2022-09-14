import { Maybe } from "to-typed";
export interface JobQueue<T, ID> {
    enqueue(task: T): Promise<ID>;
    dequeue(): Promise<{
        id: ID;
        task: T;
    } | undefined>;
}
export declare class Assigner<T, ID> {
    private readonly jobs;
    private updateRequired;
    private readonly workers;
    constructor(jobs: JobQueue<T, ID>);
    private updateLoop;
    private static delay;
    addJob(job: T): Promise<ID>;
    getWork(timeout: number): Promise<Maybe<{
        id: ID;
        task: T;
    }>>;
}
