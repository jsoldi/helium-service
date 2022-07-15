import { Maybe } from "to-typed";

interface Task<T> {
    resolve: (job: Maybe<T>) => void
    expired: boolean
}

export interface JobQueue<T> {
    enqueue(task: T): Promise<void>
    dequeue(): Promise<T | undefined>
}

export class Assigner<T> {
    private updateRequired = true;
    private readonly tasks: Task<T>[] = [];

    constructor(private readonly jobs: JobQueue<T>) { 
        this.updateLoop();
    }

    private async updateLoop() {
        while (true) {
            if (this.updateRequired) {
                this.updateRequired = false;

                let i = 0;

                while (i < this.tasks.length) {
                    const task = this.tasks[i];
        
                    if (!task.expired) {
                        const job = await this.jobs.dequeue();
        
                        if (job) {
                            task.resolve(Maybe.just(job));
                            this.tasks.splice(i, 1);
                        }
        
                        else
                            i++;
                    }
                    else {
                        task.resolve(Maybe.nothing());
                        this.tasks.splice(i, 1);
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
        await this.jobs.enqueue(job);
        this.updateRequired = true;
    }

    async doWork(timeout: number) {
        return await new Promise<Maybe<T>>(async (resolve) => {
            const task = { resolve, expired: false };
            this.tasks.push(task);
            this.updateRequired = true;
            await Assigner.delay(timeout);
            task.expired = true;
            this.updateRequired = true;
        });
    }
}
