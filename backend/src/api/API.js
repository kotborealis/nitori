const md5 = require('md5');

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const shortid = require('shortid');
shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.");

const sourceFilesHandler = require('./sourceFilesHandler');

const debug = require('debug')('nitori:api');
const express = require('express');
const fileUpload = require('express-fileupload');

const db_utils = require('../database/utils');
const {precompile} = require('../precompile/precompile');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../gnu_utils');

module.exports = async (config) => {
    const auth = require('../auth').auth(config.auth.url);
    const authHandler = require('../auth').middleware(config.auth.url);
    const db = require('nano')(config.database).use(config.database.name);

    const port = config.api.port;
    const working_dir = config.sandbox.working_dir;

    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cookieParser());

    app.use(fileUpload({
        limits: {
            fileSize: config.api.limits.fileSize
        }
    }));

    app.use(authHandler());

    app.post("/task/",
        //authHandler([({isAdmin}) => isAdmin === true]),
        sourceFilesHandler(config.api.limits, 1),
        async function(req, res) {
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

        const {rows: [row]} = await db.view("task", "by_wid_and_name", {
            key: [wid, name],
            include_docs: true
        });

        let id = row ? row.doc._id : shortid.generate();

        db_utils.multipartUpdate(db, {
            type: "task",
            name,
            wid,
            description
        }, [{
            name: file.name,
            data: file.content,
            content_type: file.content_type
        }], id);

        const compilerResult = await precompile(config, id);

        res.status(200).json({data: {
            compilerResult
        }});
    });

    app.get("/task/:wid", async function(req, res) {
        debug("/task/");

        const {rows} = await db.view("task", "by_wid", {
            key: req.params.wid,
            include_docs: true
        });
        res.json({data: rows.map(({doc}) => doc)});
    });

    app.get("/test/:id", async function(req, res, next) {
        const {id} = req.params;

        const {rows: [test]} = await db.view('test', 'by_id', {key: id, include_docs: true});

        if(!test) {
            const err = new Error("Specified test attempt does not exists");
            err.status = 404;
            next(err);
            return;
        }

        const data = test.doc;
        data.sourceFiles = await db_utils.getAllAttachments(db, id);
        res.json({data});
    });

    app.post("/test/", sourceFilesHandler(config.api.limits, 10), async function(req, res, next) {
        debug("/test/");
        const userData = await auth(req.cookies.PHPSESSID);

        const {test_id} = req.body;
        const id = shortid.generate();

        const insertResults = async (data) => {
            const sources = req.sourceFiles.map(({name, content: data, content_type}) => ({
                name, data, content_type
            }));

            await db.multipart.insert({
                type: "test",
                timestamp: Date.now(),
                userData,
                test_id,
                compilerResult: {exitCode: undefined, stdout: ""},
                linkerResult: {exitCode: undefined, stdout: ""},
                runnerResult: {exitCode: undefined, stdout: ""},
                ...data
            }, sources, id);

            const attempt = await db.get(id);
            attempt.sourceFiles = sources.map(file => {
                file.data = file.data.toString();
                return file;
            });
            res.json({data: attempt});
        };

        if(!await db_utils.exists(db, test_id)){
            const err = new Error("Selected test does not exists");
            err.status = 404;
            next(err);
            return;
        }

        const test_source = await db_utils.getFirstAttachment(db, test_id);
        const cache_key = md5(test_source);

        const sandbox = new Sandbox(docker, config);
        await sandbox.start();

        const compiler = new Compiler(sandbox, config.timeout.compilation);
        const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(req.sourceFiles, {working_dir});

        if(compilerResult.exitCode){
            await insertResults({compilerResult});
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
            await insertResults({compilerResult, linkerResult});
            await sandbox.stop();
            return;
        }

        const runnerResult = await sandbox.exec(["./" + output, "-r", "compact"], {
            timeout: config.timeout.run
        });

        await insertResults({compilerResult, linkerResult, runnerResult});

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