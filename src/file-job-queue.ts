import { JobQueue } from "./assigner";
import fs from 'fs';
import { Cast, Maybe } from "to-typed";

export class FileJobQueue<T> implements JobQueue<T> {
    private readonly cast: Cast<T[]>

    constructor(private readonly path: string, itemCast: Cast<T>) { 
        this.cast = Cast.asArrayOf<T>(itemCast);
    }

    private readFile(): string {
        try {
            return fs.readFileSync(this.path, 'utf8');
        }
        catch (e: any) {
            if (e?.code === 'ENOENT') 
                return '[]';
            else
                throw e;
        }
    }

    private writeFile(data: T[]) {
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }

    private castParse(): Maybe<T[]> {
        try {
            const json = this.readFile();
            return this.cast.cast(JSON.parse(json));
        }
        catch (e) {
            return Maybe.nothing();
        }
    }
    
    enqueue(task: T): Promise<void> {
        const maybe = this.castParse();

        if (maybe.hasValue) {
            maybe.value.push(task);
            this.writeFile(maybe.value);
        }
        else
            console.log('Could not parse file job data');
    
        return Promise.resolve();
    }

    dequeue(): Promise<T | undefined> {
        const maybe = this.castParse();

        if (maybe.hasValue) {
            const job = maybe.value.shift();
            this.writeFile(maybe.value);
            return Promise.resolve(job);
        }
        else
            console.log('Could not parse file job data')
        
        return Promise.resolve(undefined);
    }
}
