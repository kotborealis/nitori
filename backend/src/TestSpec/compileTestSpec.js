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

    const cache = md5(files.map(({content}) => content.toString()).join("\n"));
    debug("cache key", cache);

    if(objectCache.has(cache)){
        debug(`Test already precompiled, skipping...`);
        return {
            compilerResult: {exitCode: 0, stdout: "Loaded from cache", stderr: ""},
            cache
        };
    }

    // compile code
    await sandbox.start();
    const compiler = new Compiler(sandbox, config.timeout.compilation);
    const working_dir = config.sandbox.working_dir;
    const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(files, {
        working_dir,
        I: ["/opt/nitori/"]
    });

    if(compilerResult.exitCode){
        debug(`Failed to compile test with cache key ${cache}`);
        await sandbox.stop();
        return {compilerResult};
    }

    // create archive
    const ar = new Ar(sandbox);
    await ar.cr(config.testing.test_archive_name, targetBinaries, {working_dir});

    const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_archive_name);
    objectCache.put(cache, testObjStream);
    debug(`Compiled test with cache key ${cache}`);

    await sandbox.stop();
    return {compilerResult, cache};
};

const precompileTestSpecs = async (config) => {
    debug("Start TestSpecs precompilation");

    const nano = require('nano')(config.database);
    const db = new Database(nano, config.database.name);

    const {docs: rows} = await db.find({
        selector: {type: "TestSpec", removed: false}
    });

    const spec_ids = rows.map(({_id}) => _id);

    for await (const test of spec_ids){
        const files =
            (await db.getAllAttachments(test)).map(({name, data}) => ({name, content: data}));

        await compileTestSpec(config, files);
    }

    debug("Precompiled all TestSpecs");
};

module.exports = {compileTestSpec, precompileTestSpecs};