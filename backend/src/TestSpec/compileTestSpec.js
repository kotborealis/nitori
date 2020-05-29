const debug = require('debug')('nitori:testSpecCompile');
const {TestSpecModel} = require('../database');
const {ObjectCache} = require('../ObjectCache');
const {Compiler, Ar} = require('../SandboxedGnuUtils');
const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');

const compileTestSpec = async (config, files) => {
    const objectCache = new ObjectCache(config.cache.dir);
    const docker = new Docker(config.docker);
    const sandbox = new Sandbox(docker, config);

    await sandbox.start();

    const cache = objectCache.generateKey(files, sandbox.imageID);
    debug("cache key", cache);

    if(objectCache.has(cache)){
        debug(`Test already precompiled, skipping...`);
        return {
            compilerResult: {exitCode: 0, stdout: "Loaded from cache", stderr: ""},
            cache
        };
    }

    // compile code
    const compiler = new Compiler(sandbox, config.timeout.compilation);
    const working_dir = config.sandbox.working_dir;
    const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(files, {
        working_dir,
        I: ["/opt/nitori/"],
        include: ["/opt/nitori/testing.hpp"],
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

    sandbox.stop().catch((...args) => debug(...args));
    return {compilerResult, cache};
};

const precompileTestSpecs = async (config) => {
    debug("Start TestSpecs precompilation");

    const testSpecs = await TestSpecModel.find({removed: false});

    for await (const testSpec of testSpecs)
        await compileTestSpec(config, [testSpec.specFile]);

    debug("Precompiled all TestSpecs");
};

module.exports = {compileTestSpec, precompileTestSpecs};