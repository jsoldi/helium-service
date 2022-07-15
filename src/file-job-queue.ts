import { JobQueue } from "./assigner";
import fs from 'fs/promises';
import { Cast, Maybe } from "to-typed";

export class FileJobQueue<T> implements JobQueue<T> {
    private readonly cast: Cast<T[]>

    constructor(private readonly path: string, itemCast: Cast<T>) { 
        this.cast = Cast.asArrayOf<T>(itemCast);
    }

    private async readFile(): Promise<string> {
        try {
            return await fs.readFile(this.path, 'utf8');
        }
        catch (e: any) {
            if (e?.code === 'ENOENT') 
                return '[]';
            else
                throw e;
        }
    }

    private async writeFile(data: T[]) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2));
    }

    private async castParse(): Promise<Maybe<T[]>> {
        try {
            const json = await this.readFile();
            return this.cast.cast(JSON.parse(json));
        }
        catch (e) {
            return Maybe.nothing();
        }
    }
    
    async enqueue(task: T): Promise<void> {
        const maybe = await this.castParse();

        if (maybe.hasValue) {
            maybe.value.push(task);
            await this.writeFile(maybe.value);
        }
        else
            console.log('Could not parse file job data')
    }

    async dequeue(): Promise<T | undefined> {
        const maybe = await this.castParse();

        if (maybe.hasValue) {
            const job = maybe.value.shift();
            await this.writeFile(maybe.value);
            return job;
        }
        else
            console.log('Could not parse file job data')
    }
}
