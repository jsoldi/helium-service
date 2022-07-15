import fs from 'fs';
import { Cast, Maybe } from "to-typed";
export class FileJobQueue {
    constructor(path, itemCast) {
        this.path = path;
        this.cast = Cast.asArrayOf(itemCast);
    }
    readFile() {
        try {
            return fs.readFileSync(this.path, 'utf8');
        }
        catch (e) {
            if (e?.code === 'ENOENT')
                return '[]';
            else
                throw e;
        }
    }
    writeFile(data) {
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
    }
    castParse() {
        try {
            const json = this.readFile();
            return this.cast.cast(JSON.parse(json));
        }
        catch (e) {
            return Maybe.nothing();
        }
    }
    enqueue(task) {
        const maybe = this.castParse();
        if (maybe.hasValue) {
            maybe.value.push(task);
            this.writeFile(maybe.value);
        }
        else
            console.log('Could not parse file job data');
        return Promise.resolve();
    }
    dequeue() {
        const maybe = this.castParse();
        if (maybe.hasValue) {
            const job = maybe.value.shift();
            this.writeFile(maybe.value);
            return Promise.resolve(job);
        }
        else
            console.log('Could not parse file job data');
        return Promise.resolve(undefined);
    }
}
