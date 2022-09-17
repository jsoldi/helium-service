/// <reference path="../helium/types.d.ts" />
import { Cast, Convert } from 'to-typed';
export declare namespace Server {
    type Callback<E extends Endpoint> = (value: E['in']) => Promise<E['out']>;
    export const app: import("express-serve-static-core").Express;
    export function startServer(port: number, index?: string): Promise<void>;
    export function get<E extends Endpoint>(name: E['name'], parse: Cast<E['in']>, callback: Callback<E>): import("express-serve-static-core").Express;
    export function post<E extends Endpoint>(name: E['name'], parse: Cast<E['in']>, callback: Callback<E>): import("express-serve-static-core").Express;
    export const noInput: Convert<{}>;
    export {};
}
