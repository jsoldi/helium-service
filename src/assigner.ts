import { Maybe } from "to-typed";

interface Task<T> {
    resolve: (job: Maybe<T>) => void
    expired: boolean
}

export interface JobQueue<T, ID> {
    enqueue(task: T): Promise<ID>
    dequeue(): Promise<{ id: ID, task: T } | undefined>
}

export class Assigner<T, ID> {
    private updateRequired = true;
    private readonly workers: Task<{ id: ID, task: T }>[] = [];

    constructor(private readonly jobs: JobQueue<T, ID>) { 
        this.updateLoop();
    }

    private async updateLoop() {
        while (true) {
            if (this.updateRequired) {
                this.updateRequired = false;

                let i = 0;

                while (i < this.workers.length) {
                    const task = this.workers[i];
        
                    if (!task.expired) {
                        const job = await this.jobs.dequeue();
        
                        if (job) {
                            task.resolve(Maybe.just(job));
                            this.workers.splice(i, 1);
                        }
        
                        else
                            i++;
                    }
                    else {
                        task.resolve(Maybe.nothing());
                        this.workers.splice(i, 1);
                    }
                }    
            }
            else
                await Assigner.delay(250);
        }
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }

    async addJob(job: T) {
        const id = await this.jobs.enqueue(job);
        this.updateRequired = true;
        return id;
    }

    async getWork(timeout: number) {
        return await new Promise<Maybe<{ id: ID, task: T }>>(async (resolve) => {
            const task = { resolve, expired: false };
            this.workers.push(task);
            this.updateRequired = true;
            await Assigner.delay(timeout);
            task.expired = true;
            this.updateRequired = true;
        });
    }
}
