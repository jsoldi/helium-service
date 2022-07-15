/// <reference path="../helium/types.d.ts" />
import { Convert } from 'to-typed';
export declare namespace Server {
    function startServer(configPath: string): Promise<void>;
    function get<E extends Endpoint>(name: E['name'], parse: Convert<E['in']>, callback: (value: E['in']) => Promise<E['out']>): Promise<import("express-serve-static-core").Express>;
    function post<E extends Endpoint>(name: string, parse: Convert<E['in']>, callback: (value: E['in']) => Promise<E['out']>): import("express-serve-static-core").Express;
}
