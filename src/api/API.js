const fs = require('fs');
const glob = require('../utils/async-glob');
const path = require('path');
const md5 = require('md5');
const cors = require('cors');
const bodyParser = require('body-parser');

const debug = require('debug')('nitori:api');
const express = require('express');
const fileUpload = require('express-fileupload');
const {precompileTests} = require('../precompileTests');

const {Docker} = require('node-docker-api');

const {Sandbox} = require('../Sandbox/');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Objcopy} = require('../gnu_utils/');

function fileSizesValid(files) {
    if(!files || Object.keys(files).length === 0) return true;
    return Object.keys(files).map(key => files[key].truncated).every(i => !i);
}

module.exports = async (config) => {
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

    app.use(function (req, res, next) {
        debug("Files handler");

        const {files} = req;

        if(!files) {
            next();
            return;
        }

        if(!fileSizesValid(files)){
            const err = new Error(`File must be smaller than ${config.api.limits.fileSize} bytes`);
            err.reason = 'invalidFileSize';
            err.status = 400;
            next(err);
            return;
        }

        const sourceFiles = (Array.isArray(files.sources) ? files.sources : [files.sources]);

        req.sourceFiles = sourceFiles.map(({name, data}) => ({
                name, content: data
        }));

        debug(req.sourceFiles);

        next();
    });

    app.get("/task_list/", async function(req, res) {
        debug("Task list");
        const tests = await glob(config.testing.dir + '/**/*');
        res.json({data:
                tests.map(i => path.basename(i)) // FIXME
        });
    });

    app.post("/test_target/", async function (req, res, next) {
        debug("/test_target/");
        if(!req.sourceFiles) {
            const err = new Error("No source files specified");
            err.reason = "no source files";
            err.status = 400;
            next(err);
            return;
        }

        const {test_id} = req.body;
        const test_source = fs.readFileSync(path.join(config.testing.dir, test_id));
        const cache_key = md5(test_source);

        const sandbox = new Sandbox(docker, config);
        await sandbox.start();

        const compiler = new Compiler(sandbox, config.timeout.compilation);
        const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(req.sourceFiles, {working_dir});

        if(compilerResult.exitCode){
            res.json({data: {
                    compilerResult
            }});

            await sandbox.stop();
            return;
        }

        const objcopy = new Objcopy(sandbox);
        await objcopy.redefine_sym(targetBinaries, "main", config.testing.hijack_main, {working_dir});

        if(!objectCache.has(cache_key)) {
            const err = new Error("Failed to fetch test binary from cache; please run --precompile");
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
            res.json({data: {
                    compilerResult,
                    linkerResult
            }});

            await sandbox.stop();
            return;
        }

        debug("START PROCESS WITH TIMEOUT", config.timeout.run);
        const runnerResult = await sandbox.exec(["./" + output], {
            timeout: config.timeout.run
        });

        res.json({data: {
                compilerResult,
                linkerResult,
                runnerResult
        }});

        await sandbox.stop();
    });

    //noinspection JSUnusedLocalSymbols
    app.use(function (err, req, res, next) {
        debug("Error handler: ", err.message);

        res.status(err.status).json({
            error: {
                reason: err.reason,
                message: err.message,
                status: err.status
            }
        });
    });

    app.listen(port, () => debug(`Server running on 0.0.0.0:${port}`));
};