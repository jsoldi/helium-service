export { Server } from './server.js';
export { Assigner } from './assigner.js';
export { FileJobQueue, FileJobMonitor } from './file-job-queue.js';

// import { Convert, Guard, Maybe } from "to-typed"
// import { Api } from "./api.js"
// import { Assigner } from "./assigner.js";
// import { FileJobQueue } from "./fileJobQueue.js";

// const fileJobQueue = new FileJobQueue<EventRequest>('./data/eventRequests.json', Guard.is({
//     eventUrl: '',
//     eventId: ''
// }));

// const eventRequests = new Assigner(fileJobQueue);

// Api.get<Endpoints['set-event']>('set-event', Convert.to({ eventUrl: '', eventId: '' }), async arg => {
//     await eventRequests.addJob(arg);
//     return { success: true };
// })

// Api.get<Endpoints['get-event']>('get-event', Convert.to({ timeout: 30000 }), async arg => {
//     const maybe = await eventRequests.doWork(arg.timeout);
//     return Maybe.any([maybe]);
// })

// Api.startServer('./data/config.json');
