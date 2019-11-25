const {Router} = require('express');
const Database = require('../../database');
const filesHandler = require('../middleware/filesMiddleware');
const shortid = require('shortid');
const md5 = require('md5');
const {Objcopy} = require('../../SandboxedGnuUtils');
const {Compiler} = require('../../SandboxedGnuUtils');
const {Sandbox} = require('../../Sandbox');
const {Docker} = require('node-docker-api');
const {ObjectCache} = require('../../ObjectCache');

module.exports = (config) => {
    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);
    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);

    router.route('/')
        .get(async (req, res) => {
            const {id} = req.query;

            const {docs: [test]} = await db.find({selector: {_id: id, type: "TestTarget"}});

            if(!test){
                const err = new Error("Specified TestTarget does not exists");
                err.status = 404;
                throw err;
            }

            test.sourceFiles = await db.getAllAttachments(id);
            res.json(test);
        })
        .post(filesHandler(config.api.limits, 1, 10),
            async (req, res) => {
                const userData = await auth(req.cookies.PHPSESSID);

                const {testSpecId} = req.query;
                const id = shortid.generate();

                const insertResults = async (data) => {
                    const sources = req.files.map(({name, content: data, content_type}) => ({
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
                    attempt.sourceFiles = sources.map(file => ({
                        ...file,
                        data: file.data.toString()
                    }));
                    res.json(attempt);
                };

                if(!await db.exists(testSpecId)){
                    const err = new Error("Selected TestSpec does not exists");
                    err.status = 404;
                    throw err;
                }

                const test_source = await db.getFirstAttachment(testSpecId);
                const cache_key = md5(test_source);

                const sandbox = new Sandbox(docker, config);
                await sandbox.start();

                const compiler = new Compiler(sandbox, config.timeout.compilation);
                const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(req.files, {working_dir});

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
                    throw err;
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

    router.route('/list')
        .get(async function(req, res) {
            const {
                limit,
                skip,
                testSpecId,
                timestampStart,
                timestampEnd,
                userDataId,
                userDataLogin,
                userDataName,
                userDataGroupId,
                userDataGroupName
            } = req.query;

            const selector = {
                type: "TestTarget",
                testSpecId: testSpecId ? {"$eq": testSpecId} : undefined,
                timestamp: (timestampStart || timestampEnd) ? {
                    "$gte": timestampStart ? timestampStart : undefined,
                    "$lte": timestampEnd ? timestampEnd : undefined,
                } : undefined,
                userDataId: userDataId ? {"$eq": userDataId} : undefined,
                userDataLogin: userDataLogin ? {"$eq": userDataLogin} : undefined,
                userDataName: userDataName ? {"$eq": userDataName} : undefined,
                userDataGroupId: userDataGroupId ? {"$eq": userDataGroupId} : undefined,
                userDataGroupName: userDataGroupName ? {"$eq": userDataGroupName} : undefined,
            };

            const {docs} = await db.find({
                limit,
                skip,
                selector
            });

            res.json(docs);
        });

    return router;
};