const fs = require('fs');
const glob = require('../utils/async-glob');
const path = require('path');
const md5 = require('md5');
const cors = require('cors');
const bodyParser = require('body-parser');

const EventEmitter = require('events');
const shortid = require('shortid');

const sourceFilesHandler = require('./sourceFilesHandler');

const debug = require('debug')('nitori:api');
const express = require('express');
const fileUpload = require('express-fileupload');
const {precompileTests} = require('../precompileTests');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../gnu_utils');

const {sse_req_handler, sse_err_handler} = require('../sse/SSE');

module.exports = async (config) => {
    const tasksEvents = new EventEmitter;
    const tasks = new Set;

    await precompileTests(config);

    const port = config.api.port;
    const working_dir = config.sandbox.working_dir;

    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(fileUpload({
        limits: {
            fileSize: config.api.limits.fileSize
        }
    }));

    app.get("/task/", async function(req, res) {
        debug("/task/");
        const tests = await glob(config.testing.dir + '/**/*');
        res.json({
            data:
                tests.map(i => path.basename(i)) // FIXME
        });
    });

    app.get('/task/:filename', function(req, res) {
        const file = path.join(config.testing.dir, req.params.filename);

        if(!fs.existsSync(file)){
            debug("requested file does not exists", file);
            res.status(404).end();
            return;
        }

        fs.createReadStream(file).pipe(res);
    });

    app.get("/test/:id", sse_req_handler(1000, 1000), async function(req, res, next) {
        debug("/test/:id");

        const {id} = req.params;

        if(!tasks.has(id)) {
            const err = new Error("No such task");
            err.reason = "No such task";
            err.status = 400;
            next(err);
            return;
        }

        tasksEvents.on(id, ({event, data, error}) => {
            res.sse.emit(event, {data, error});

            if(event === 'stop') {
                tasksEvents.removeAllListeners(id);
                res.sse.end();
            }
        });
    });

    app.post("/test/", sourceFilesHandler, async function(req, res, next) {
        debug("/test/");
        if(!req.sourceFiles){
            const err = new Error("No source files specified");
            err.reason = "no source files";
            err.status = 400;
            next(err);
            return;
        }

        res.task_id = shortid.generate();
        tasks.add(res.task_id);

        res.json({data: {taskId: res.task_id}});

        const {test_id} = req.body;
        const test_source = fs.readFileSync(path.join(config.testing.dir, test_id));
        const cache_key = md5(test_source);

        const sandbox = new Sandbox(docker, config);
        await sandbox.start();

        const compiler = new Compiler(sandbox, config.timeout.compilation);
        const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(req.sourceFiles, {working_dir});

        tasksEvents.emit(res.task_id, {
            event: 'compilation',
            data: {compilerResult}
        });

        if(compilerResult.exitCode){
            tasksEvents.emit(res.task_id, {event: 'stop'});
            await sandbox.stop();
            tasks.delete(res.task_id);
            return;
        }

        const objcopy = new Objcopy(sandbox);
        await objcopy.redefine_sym(targetBinaries, "main", config.testing.hijack_main, {working_dir});

        if(!objectCache.has(cache_key)){
            const err = new Error("Failed to fetch test binary from cache; please run --precompile");
            err.status = 500;
            next(err);
            tasks.delete(res.task_id);
            return;
        }
        else{
            await sandbox.fs_put(objectCache.get(cache_key), working_dir);
        }

        const {exec: linkerResult, output} = await compiler.link(
            [...targetBinaries, config.testing.test_obj_name]
        );

        tasksEvents.emit(res.task_id, {
            event: 'linking',
            data: {
                compilerResult,
                linkerResult
            }
        });

        if(linkerResult.exitCode !== 0){
            tasksEvents.emit(res.task_id, {event: 'stop'});
            await sandbox.stop();
            tasks.delete(res.task_id);
            return;
        }

        const runnerResult = await sandbox.exec(["./" + output, "-r", "compact", "-s"], {
            timeout: config.timeout.run
        });

        tasksEvents.emit(res.task_id, {
            event: 'testing',
            data: {
                compilerResult,
                linkerResult,
                runnerResult
            }
        });

        tasksEvents.emit(res.task_id, {event: 'stop'});

        await sandbox.stop();
        tasks.delete(res.task_id);
    });

    app.use(sse_err_handler);

    //noinspection JSUnusedLocalSymbols
    app.use(function(err, req, res, next) {
        debug("Error handler: ", err.message);

        if(res.task_id){
            tasksEvents.emit(res.task_id, {
                event: 'error',
                error: {
                    reason: err.reason,
                    message: err.message,
                    status: err.status
                }
            });
            tasksEvents.emit(res.task_id, {event: 'stop'});
        }

        if(res.finished) return;

        res.status(err.status).json({
            error: {
                reason: err.reason,
                message: err.message,
                status: err.status
            }
        });
    });

    const server = app.listen(port, () => debug(`Server running on 0.0.0.0:${port}`));

    process.on('SIGINT', async () => {
        server.close();
        try {
            await Sandbox.destroy_all(docker);
            process.exit(0);
        }
        catch(e){
            debug("Error on handling signal", e);
            process.exit(1);
        }
    });
};