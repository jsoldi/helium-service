/// <reference path="./types.d.ts" />

namespace Client {
    export let timeout = 60000;

    export function get<E extends Endpoint>(port: string, name: E['name'], arg: E['in']) {
        if (arg == null || typeof arg !== "object" || Array.isArray(arg)) 
            throw new Error("Argument must be an object");   
    
        const query = Object.entries(arg).map(([key, value]) => `${key}=${encodeURIComponent((value as any ?? '').toString())}`).join('&');
        const json = global.webRequest(`http://localhost:${port}/${name}?${query}`, 'GET', null, null, timeout, false).response as string;
        return JSON.parse(json) as E['out'];
    }
    
    export function post<E extends Endpoint>(port: string, name: E['name'], arg: E['in']) {
        if (arg == null || typeof arg !== "object") 
            throw new Error("Argument must be an object or an array");   

        const json = global.webRequest(
            `http://localhost:${port}/${name}`, 
            'POST', 
            { 'Content-Type': 'application/json' }, 
            JSON.stringify(arg), 
            timeout, 
            false
        ).response as string;
    
        return JSON.parse(json) as E['out'];
    }
}
