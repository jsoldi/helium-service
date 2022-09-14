/// <reference path="../helium/types.d.ts" />
import express from 'express';
import fs from 'fs/promises';
import { Convert } from 'to-typed';
export var Server;
(function (Server) {
    const app = express();
    app.get('/index.html', async (_req, res) => {
        try {
            const html = await fs.readFile('./index.html', 'utf8');
            res.send(html);
        }
        catch (e) {
            res.status(404).send('Not found');
        }
    });
    app.use(express.json());
    async function startServer(port) {
        app.listen(port, () => console.log('Listening on port ' + port));
    }
    Server.startServer = startServer;
    function get(name, parse, callback) {
        return app.get(`/${name}`, async function (req, res) {
            return parse.cast(req.query).read(async (value) => res.json(await callback(value)), async () => res.status(400).send('Invalid query'));
        });
    }
    Server.get = get;
    function post(name, parse, callback) {
        return app.post(`/${name}`, async function (req, res) {
            return parse.cast(req.body).read(async (value) => res.json(await callback(value)), async () => res.status(400).send('Invalid post body'));
        });
    }
    Server.post = post;
    Server.noInput = Convert.id.map(() => ({}));
})(Server || (Server = {}));
