/// <reference path="../helium/types.d.ts" />

import express from 'express';
import fs from 'fs/promises';
import { Cast, Convert, Guard } from 'to-typed';
import cp from 'child_process';

export namespace Server {
    type Callback<E extends Endpoint> = (value: E['in']) => Promise<E['out']>   
    const app = express();

    app.use(express.json());

    export async function startServer(port: number, index?: string) {
        if (index) {
            app.get('/index.html', async (_req, res) => {
                try {
                    const html = await fs.readFile(index, 'utf8')
                    res.send(html);
                }
                catch (e: any) {
                    res.status(404).send('Not found');
                }
            });
        }

        app.listen(port, () => console.log('Listening on port ' + port));
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
