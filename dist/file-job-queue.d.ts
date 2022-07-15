import { JobQueue } from "./assigner";
import { Cast } from "to-typed";
export declare class FileJobQueue<T> implements JobQueue<T> {
    private readonly path;
    private readonly cast;
    constructor(path: string, itemCast: Cast<T>);
    private readFile;
    private writeFile;
    private castParse;
    enqueue(task: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
}
