const fs = require('fs');
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

const Nano = require('nano');
const db_utils = require('../database/utils');
const {precompile} = require('../precompile/precompile');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../gnu_utils');

module.exports = async (config) => {
    const nano = Nano(config.database);
    const tasks_db = nano.use('tasks');
    const test_attemps_db = nano.use('test_attempts');

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

    app.post("/task/", sourceFilesHandler(config.api.limits, 1), async function(req, res) {
        if(!req.sourceFiles){
            const err = new Error("No source files specified");
            err.reason = "no source files";
            err.status = 400;
            next(err);
            return;
        }

        if(req.sourceFiles.length !== 1){
            const err = new Error("Only one source file must be specified");
            err.reason = "Only one source file must be specified";
            err.status = 400;
            next(err);
            return;
        }

        const file = req.sourceFiles[0];
        const {name, description = "", wid} = req.body;

        const {rows: [row]} = await tasks_db.view("task", "by_wid_and_name", {
            key: [wid, name],
            include_docs: true
        });

        let id = row ? row.doc._id : shortid.generate();

        db_utils.multipartUpdate(tasks_db, {name, wid, description}, [{
            name: file.name,
            data: file.content,
            content_type: file.content_type
        }], id);

        await precompile(config, id);

        res.status(200).end();
    });

    app.get("/task/:wid", async function(req, res) {
        debug("/task/");

        const {rows} = await tasks_db.view("task", "by_wid", {key: req.params.wid});
        res.json({data: rows.map(({value}) => value)});
    });

    app.get('/task/content/:id', function(req, res) {
        const file = path.join(config.testing.dir, req.params.filename);

        if(!fs.existsSync(file)){
            debug("requested file does not exists", file);
            res.status(404).end();
            return;
        }

        fs.createReadStream(file).pipe(res);
    });

    app.get("/test/:id", async function(req, res, next) {
        const {id} = req.params;
        if(!await db_utils.exists(test_attemps_db, id)){
            const err = new Error("Specified test attempt does not exists");
            err.status = 404;
            next(err);
            return;
        }

        const data = await test_attemps_db.get(id);
        res.json({data});
    });

    app.post("/test/", sourceFilesHandler(config.api.limits, 10), async function(req, res, next) {
        const id = shortid.generate();
        const insertResults = data => {
            test_attemps_db.insert({
                compilerResult: {exitCode: undefined, stdout: ""},
                linkerResult: {exitCode: undefined, stdout: ""},
                runnerResult: {exitCode: undefined, stdout: ""},
                ...data
            }, id);
        };

        debug("/test/");

        const {test_id} = req.body;

        if(!await db_utils.exists(tasks_db, test_id)){
            const err = new Error("Selected test does not exists");
            err.status = 404;
            next(err);
            return;
        }

        const test_source = await db_utils.getFirstAttachment(tasks_db, test_id);
        const cache_key = md5(test_source);

        const sandbox = new Sandbox(docker, config);
        await sandbox.start();

        const compiler = new Compiler(sandbox, config.timeout.compilation);
        const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(req.sourceFiles, {working_dir});

        if(compilerResult.exitCode){
            res.json({data: {id, compilerResult}});
            await insertResults({test_id, compilerResult});
            await sandbox.stop();
            return;
        }

        const objcopy = new Objcopy(sandbox);
        await objcopy.redefine_sym(targetBinaries, "main", config.testing.hijack_main, {working_dir});

        if(!objectCache.has(cache_key)){
            const err = new Error("Failed to fetch test binary from cache; please run --precompile_all");
            err.status = 500;
            next(err);
            return;
        }
        else{
            await sandbox.fs_put(objectCache.get(cache_key), working_dir);
        }

        const {exec: linkerResult, output} = await compiler.link(
            [...targetBinaries, config.testing.test_obj_name]
        );

        if(linkerResult.exitCode !== 0){
            res.json({data: {id, compilerResult, linkerResult}});
            await insertResults({test_id, compilerResult, linkerResult});
            await sandbox.stop();
            return;
        }

        const runnerResult = await sandbox.exec(["./" + output, "-r", "compact"], {
            timeout: config.timeout.run
        });

        res.json({data: {id, compilerResult, linkerResult, runnerResult}});
        await insertResults({test_id, compilerResult, linkerResult, runnerResult});

        await sandbox.stop();
    });

    //noinspection JSUnusedLocalSymbols
    app.use(function(err, req, res, next) {
        debug("Error handler: ", err);

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
        try{
            await Sandbox.destroy_all(docker);
            process.exit(0);
        }
        catch(e){
            debug("Error on handling signal", e);
            process.exit(1);
        }
    });
};