/// <reference path="../helium/types.d.ts" />

import express from 'express';
import fs from 'fs/promises';
import { Cast, Convert, Guard } from 'to-typed';
import cp from 'child_process';

export namespace Server {
    type Callback<E extends Endpoint> = (value: E['in']) => Promise<E['out']>

    const configType = Guard.is({ 
        hsc: '',
        launchHelium: false,
        port: 0
    });
    
    const app = express();

    app.get('/index.html', async (req, res) => {
        try {
            // try get html from ./index.html file
            const html = await fs.readFile('./index.html', 'utf8')
            res.send(html);
        }
        catch (e: any) {
            const currentFolder = process.cwd();
            const html = `<html><body><pre>${currentFolder}</pre></body></html>`
            return res.send(html);
        }
    });

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

    export function get<E extends Endpoint>(name: E['name'], parse: Cast<E['in']>, callback: Callback<E>) {
        return app.get(`/${name}`, async function (req, res) {
            return parse.cast(req.query).read(
                async value => res.json(await callback(value)),
                async () => res.status(400).send('Invalid query')
            )
        });
    }
    
    export function post<E extends Endpoint>(name: E['name'], parse: Cast<E['in']>, callback: Callback<E>) {
        return app.post(`/${name}`, async function (req, res) {
            return parse.cast(req.body).read(
                async value => res.json(await callback(value)),
                async () => res.status(400).send('Invalid post body')
            )
        });
    }

    export const noInput = Convert.id.map(() => ({}));
}
