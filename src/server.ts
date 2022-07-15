/// <reference path="../helium/types.d.ts" />

import express from 'express';
import fs from 'fs/promises';
import { Cast, Convert, Guard } from 'to-typed';
import cp from 'child_process';

export namespace Server {
    const configType = Guard.is({ 
        hsc: '',
        launchHelium: false,
        port: 0
    });
    
    const app = express();
    app.use(express.json());

    function castParse<T>(cast: Cast<T>, value: string): T {
        return cast.cast(JSON.parse(value)).elseThrow(() => new Error('Invalid JSON: ' + value));
    }

    export async function startServer(configPath: string) {
        const config = castParse(configType, await fs.readFile(configPath, 'utf8'));
        app.listen(config.port, () => console.log('Listening on port ' + config.port));
    
        if (config.launchHelium)
            cp.exec(`hsc ${config.hsc} --edit --open-unsafe-project port=${config.port}`)
    }
    
    export async function get<E extends Endpoint>(name: E['name'], parse: Convert<E['in']>, callback: (value: E['in']) => Promise<E['out']>) {
        return app.get(`/${name}`, async function (req, res) {
            const s = parse.cast(req.query).elseThrow(() => new Error('Invalid query: ' + req.query));
            const t = await callback(s);
            return res.json(t);
        });
    }
    
    export function post<E extends Endpoint>(name: string, parse: Convert<E['in']>, callback: (value: E['in']) => Promise<E['out']>) {
        return app.post(`/${name}`, async function (req, res) {
            const s = parse.cast(req.body).elseThrow(() => new Error('Invalid body: ' + req.query));
            const t = await callback(s);
            return res.json(t);
        });
    }
}
