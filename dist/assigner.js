import { Maybe } from "to-typed";
export class Assigner {
    constructor(jobs) {
        this.jobs = jobs;
        this.updateRequired = true;
        this.tasks = [];
        this.updateLoop();
    }
    async updateLoop() {
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
    static delay(ms) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    async addJob(job) {
        await this.jobs.enqueue(job);
        this.updateRequired = true;
    }
    async doWork(timeout) {
        return await new Promise(async (resolve) => {
            const task = { resolve, expired: false };
            this.tasks.push(task);
            this.updateRequired = true;
            await Assigner.delay(timeout);
            task.expired = true;
            this.updateRequired = true;
        });
    }
}
