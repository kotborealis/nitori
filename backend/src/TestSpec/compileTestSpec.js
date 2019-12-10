const debug = require('debug')('nitori:testSpecCompile');
const md5 = require('md5');
const Database = require('../database');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Ar} = require('../SandboxedGnuUtils');
const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');

const compileTestSpec = async (config, files) => {
    const objectCache = new ObjectCache(config.cache.dir);
    const docker = new Docker(config.docker);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const cache_key = md5(files.map(({content}) => md5(content)));
    debug("cache key", cache_key);

    if(objectCache.has(cache_key)){
        debug(`Test already precompiled, skipping...`);
        return {
            compilerResult: {exitCode: 0, stdout: "Loaded from cache", stderr: ""}
        };
    }

    // compile code
    const compiler = new Compiler(sandbox, config.timeout.compilation);
    const working_dir = config.sandbox.working_dir;
    const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(files, {working_dir});

    if(compilerResult.exitCode){
        await sandbox.stop();
        return {compilerResult};
    }

    // create archive
    const ar = new Ar(sandbox);
    await ar.cr(config.testing.test_archive_name, targetBinaries, {working_dir});

    const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_archive_name);
    objectCache.put(cache_key, testObjStream);
    debug(`Compiled test with cache key ${cache_key}`);

    await sandbox.stop();
    return {compilerResult};
};

const precompileTestSpecs = async (config) => {
    debug("Start TestSpecs precompilation");

    const nano = require('nano')(config.database);
    const db = new Database(nano, config.database.name);

    const {docs: rows} = await db.find({
        selector: {type: "TestSpec"}
    });

    const spec_ids = rows.map(({_id}) => _id);

    for await (const test of spec_ids){
        const files =
            (await db.getAllAttachments(test)).map(({name, data}) => ({name, content: data}));

        await compile(config, files);
    }

    debug("Precompiled all TestSpecs");
};

module.exports = {compileTestSpec, precompileTestSpecs};