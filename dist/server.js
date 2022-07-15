/// <reference path="../helium/types.d.ts" />
import express from 'express';
import fs from 'fs/promises';
import { Guard } from 'to-typed';
import cp from 'child_process';
export var Server;
(function (Server) {
    const configType = Guard.is({
        hsc: '',
        launchHelium: false,
        port: 0
    });
    const app = express();
    app.use(express.json());
    function castParse(cast, value) {
        return cast.cast(JSON.parse(value)).elseThrow(() => new Error('Invalid JSON: ' + value));
    }
    async function startServer(configPath) {
        const config = castParse(configType, await fs.readFile(configPath, 'utf8'));
        app.listen(config.port, () => console.log('Listening on port ' + config.port));
        if (config.launchHelium)
            cp.exec(`hsc ${config.hsc} --edit --open-unsafe-project port=${config.port}`);
    }
    Server.startServer = startServer;
    async function get(name, parse, callback) {
        return app.get(`/${name}`, async function (req, res) {
            const s = parse.cast(req.query).elseThrow(() => new Error('Invalid query: ' + req.query));
            const t = await callback(s);
            return res.json(t);
        });
    }
    Server.get = get;
    function post(name, parse, callback) {
        return app.post(`/${name}`, async function (req, res) {
            const s = parse.cast(req.body).elseThrow(() => new Error('Invalid body: ' + req.query));
            const t = await callback(s);
            return res.json(t);
        });
    }
    Server.post = post;
})(Server || (Server = {}));
