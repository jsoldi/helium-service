import fs from 'fs/promises';
import { Cast, Maybe } from "to-typed";
export class FileJobQueue {
    constructor(path, itemCast) {
        this.path = path;
        this.cast = Cast.asArrayOf(itemCast);
    }
    async readFile() {
        try {
            return await fs.readFile(this.path, 'utf8');
        }
        catch (e) {
            if (e?.code === 'ENOENT')
                return '[]';
            else
                throw e;
        }
    }
    async writeFile(data) {
        await fs.writeFile(this.path, JSON.stringify(data, null, 2));
    }
    async castParse() {
        try {
            const json = await this.readFile();
            return this.cast.cast(JSON.parse(json));
        }
        catch (e) {
            return Maybe.nothing();
        }
    }
    async enqueue(task) {
        const maybe = await this.castParse();
        if (maybe.hasValue) {
            maybe.value.push(task);
            await this.writeFile(maybe.value);
        }
        else
            console.log('Could not parse file job data');
    }
    async dequeue() {
        const maybe = await this.castParse();
        if (maybe.hasValue) {
            const job = maybe.value.shift();
            await this.writeFile(maybe.value);
            return job;
        }
        else
            console.log('Could not parse file job data');
    }
}
