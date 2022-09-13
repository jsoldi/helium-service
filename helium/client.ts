/// <reference path="./types.d.ts" />

namespace Client {
    export let timeout = 120000;

    export async function get<E extends Endpoint>(port: string, name: E['name'], arg: E['in']) {
        if (arg == null || typeof arg !== "object" || Array.isArray(arg)) 
            throw new Error("Argument must be an object");   
    
        const query = Object.entries(arg).map(([key, value]) => `${key}=${encodeURIComponent((value as any ?? '').toString())}`).join('&');
        const result = await global.webRequestAsync(`http://localhost:${port}/${name}?${query}`, 'GET', null, null, timeout, false);
        return JSON.parse(result.response as string) as E['out'];
    }
    
    export async function post<E extends Endpoint>(port: string, name: E['name'], arg: E['in']) {
        if (arg == null || typeof arg !== "object") 
            throw new Error("Argument must be an object or an array");   

        const result = await global.webRequestAsync(
            `http://localhost:${port}/${name}`, 
            'POST', 
            { 'Content-Type': 'application/json' }, 
            JSON.stringify(arg), 
            timeout, 
            false
        );
    
        return JSON.parse(result.response as string) as E['out'];
    }
}
