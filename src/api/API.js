const debug_api = require('debug')('nitori-api');
const express = require('express');
const fileUpload = require('express-fileupload');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox/');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../gnu_utils/');

function fileSizesValid(files) {
    if(!files || Object.keys(files).length === 0) return true;
    return Object.keys(files).map(key => files[key].truncated).every(i => !i);
}

module.exports = (config) => {
    const port = config.api.port;
    const working_dir = config.sandbox.working_dir;

    const docker = new Docker(config.docker);
    const app = express();

    app.use(fileUpload({
        limits: {
            fileSize: config.api.limits.fileSize
        }
    }));

    app.use((req, res, next) => {
        debug_api("Files handler");

        const {files} = req;

        if(fileSizesValid(files)){
            const err = new Error(`File must be smaller than ${config.api.limits.fileSize} bytes`);
            err.reason = 'invalidFileSize';
            err.status = 400;
            next(err);
            return;
        }

        req.sourceFiles = Object.keys(files).map(key => files[key]).map(({name, data}) => ({
            name, content: data
        }));

        next();
    });

    app.use(function (err, req, res, next) {
        debug_api("Error handler", err.message);

        res.status(err.status).json({
            error: {
                reason: err.reason,
                message: err.message,
            }
        });
    });

    app.post("/compile_target/", async (req, res) => {
        const sandbox = new Sandbox(docker, config);
        await sandbox.start();
        const compiler = new Compiler(sandbox);
        const {exec} = await compiler.compile_obj(req.sourceFiles, {working_dir});
        await sandbox.stop();

        res.json({data: exec});
    });

    app.listen(port, () => debug_api(`Server running on 0.0.0.0:${port}`));
};