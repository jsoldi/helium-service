interface Endpoint<N extends string = string, I extends object = {}, O extends object = {}> {
    readonly name: N
    readonly in: I
    readonly out: O
}

// interface EventRequest {
//     eventUrl: string
//     eventId: string
// }

// interface Endpoints {
//     'set-event': Endpoint<'set-event', EventRequest, { success: boolean }>,
//     'get-event': Endpoint<'get-event', { timeout: number }, EventRequest[]>
// }
