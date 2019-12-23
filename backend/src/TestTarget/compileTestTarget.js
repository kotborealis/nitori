const {Objcopy} = require('../SandboxedGnuUtils');
const {Compiler} = require('../SandboxedGnuUtils');
const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');
const {ObjectCache} = require('../ObjectCache');

module.exports = async (config, cache, files) => {
    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const compiler = new Compiler(sandbox, config.timeout.compilation);
    const working_dir = config.sandbox.working_dir;
    const {exec: compilerResult, obj: targetBinaries} = await compiler.compile(files, {working_dir});

    if(compilerResult.exitCode){
        await sandbox.stop();
        return {compilerResult};
    }

    const objcopy = new Objcopy(sandbox);
    await objcopy.redefine_sym(targetBinaries, "main", config.testing.hijack_main, {working_dir});

    if(!objectCache.has(cache)){
        const err = new Error("Failed to fetch TestSpec binary from cache");
        err.status = 500;
        throw err;
    }
    else{
        await sandbox.fs_put(objectCache.get(cache), working_dir);
    }

    const {exec: linkerResult, output} = await compiler.link(
        [...targetBinaries, config.testing.test_archive_name]
    );

    if(linkerResult.exitCode !== 0){
        await sandbox.stop();
        return {compilerResult, linkerResult};
    }

    const runnerResult = await sandbox.exec(["./" + output, "-r", "compact"], {
        timeout: config.timeout.run
    });

    await sandbox.stop();

    return {compilerResult, linkerResult, runnerResult};
};