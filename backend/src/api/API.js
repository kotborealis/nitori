const md5 = require('md5');

const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api.yaml');

const swaggerUi = require('swagger-ui-express');
const {OpenApiValidator} = require('express-openapi-validator');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const shortid = require('shortid');
shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.");

const filesHandler = require('./filesHandler');

const debug = require('debug')('nitori:api');
const express = require('express');
const fileUpload = require('express-fileupload');

const Database = require('../database');
const {precompile} = require('../TestSpecPrecompile/precompile');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../SandboxedGnuUtils');

module.exports = async (config) => {
    const auth = require('../auth').auth(config.auth.url);
    const authHandler = require('../auth').middleware(config.auth.url);
    const db = new Database(require('nano')(config.database), config.database.name);

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

    //app.use(authHandler());

    app.use('/swagger/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    new OpenApiValidator({
        apiSpec: './api.yaml',
        validateRequests: true,
        validateResponses: {
            removeAdditional: 'failing'
        },
        multerOpts: {
            limits: {
                fileSize: config.api.limits.fileSize
            }
        }
    }).install(app);

    app.post("/TestSpec",
        //authHandler([({isAdmin}) => isAdmin === true]),
        filesHandler(config.api.limits, 1, 1),
        async function(req, res) {
            const [file] = req.files;
            const {wid} = req.query;
            const {name, description = ""} = req.body;

            const {rows: [row]} = await db.view("TestSpec", "by_wid_and_name", {
                key: [wid, name],
                include_docs: true
            });

            let id = row ? row.doc._id : shortid.generate();

            await db.multipart.update({
                type: "TestSpec",
                name,
                wid,
                description
            }, [{
                name: file.name,
                data: file.content,
                content_type: file.content_type
            }], id);

            const compilerResult = await precompile(config, id);

            res.json(compilerResult);
        });

    app.get("/TestSpec", async function(req, res) {
        debug("/TestSpec/");

        const {rows} = await db.view("TestSpec", "by_wid", {
            key: req.query.wid,
            include_docs: true
        });
        res.json(rows.map(({doc}) => doc));
    });

    app.get("/TestTarget", async function(req, res, next) {
        const {id} = req.query;

        const {rows: [test]} = await db.view('TestTarget', 'by_id', {key: id, include_docs: true});

        if(!test){
            const err = new Error("Specified TestTarget does not exists");
            err.status = 404;
            next(err);
            return;
        }

        const data = test.doc;
        data.sourceFiles = await db.getAllAttachments(id);
        res.json(data);
    });

    app.post("/TestTarget/",
        filesHandler(config.api.limits, 1, 10),
        async function(req, res, next) {
            debug("/TestTarget/");
            const userData = await auth(req.cookies.PHPSESSID);

            const {testSpecId} = req.query;
            const id = shortid.generate();

            const insertResults = async (data) => {
                const sources = req.sourceFiles.map(({name, content: data, content_type}) => ({
                    name, data, content_type
                }));

                await db.multipart.insert({
                    type: "TestTarget",
                    timestamp: Date.now(),
                    userData,
                    testSpecId: testSpecId,
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
                res.json(attempt);
            };

            if(!await db.exists(testSpecId)){
                const err = new Error("Selected TestSpec does not exists");
                err.status = 404;
                next(err);
                return;
            }

            const test_source = await db.getFirstAttachment(testSpecId);
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
                const err = new Error("Failed to fetch TestSpec binary from cache");
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
            message: err.message,
            errors: err.errors || [err.message]
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