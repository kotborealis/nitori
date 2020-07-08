const {Objcopy} = require('../SandboxedGnuUtils');
const logger = require(('../logging/logger')).logger('compileSpecRunner');
const {Compiler} = require('../SandboxedGnuUtils');
const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');

const compileSpecRunner = async (config, spec, example) => {
    const docker = new Docker(config.docker);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const compiler = new Compiler(sandbox, config.timeout.compilation);
    const working_dir = config.sandbox.working_dir;

    const {
        exec: specCompilerResult,
        obj: specBinaries
    } = await compiler.compile([{
        name: "spec.cpp",
        content: spec
    }], {working_dir, I: ["/opt/nitori/"], include: ["/opt/nitori/testing.hpp"]});

    if(specCompilerResult.exitCode){
        logger.debug(`Failed to compile spec`);
        await sandbox.stop();
        return {specCompilerResult};
    }

    const {
        exec: exampleCompilerResult,
        obj: exampleBinaries
    } = await compiler.compile([{
        name: "example.cpp",
        content: example
    }], {working_dir});

    if(exampleCompilerResult.exitCode){
        logger.notice(`Failed to compile example`);
        await sandbox.stop();
        return {specCompilerResult, exampleCompilerResult};
    }

    const objcopy = new Objcopy(sandbox);
    await objcopy.redefine_sym(exampleBinaries, "main", config.testing.hijack_main, {working_dir});

    const {exec: linkerResult, output} = await compiler.link(
        [...exampleBinaries, ...specBinaries]
    );

    if(linkerResult.exitCode !== 0){
        await sandbox.stop();
        return {specCompilerResult, exampleCompilerResult, linkerResult};
    }

    const runnerResult = await sandbox.exec(["./" + output], {
        timeout: config.timeout.run
    });

    sandbox.stop().catch((...args) => logger.error(...args));

    return {specCompilerResult, exampleCompilerResult, linkerResult, runnerResult};
};

module.exports = {compileSpecRunner};