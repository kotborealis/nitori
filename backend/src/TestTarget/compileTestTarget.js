const {Objcopy} = require('../SandboxedGnuUtils');
const {Compiler} = require('../SandboxedGnuUtils');
const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');

/**
 *
 * @param config
 * @param {TestSpecModel} testSpec
 * @param {TestTargetModel} testTarget
 * @returns {Promise<{linkerResult: *, targetCompilerResult: *, runnerResult: {stdout, exitCode: *, stderr}, specCompilerResult: *}|{targetCompilerResult: *, specCompilerResult: *}|{targetCompilerResult: *}|{linkerResult: *, targetCompilerResult: *, specCompilerResult: *}>}
 */
module.exports = async (config, testSpec, testTarget) => {
    const docker = new Docker(config.docker);
    const sandbox = new Sandbox(docker, config);
    const working_dir = config.sandbox.working_dir;
    await sandbox.start();

    const targetCompiler = new Compiler(sandbox, config.timeout.compilation);
    const {exec: targetCompilerResult, obj: targetBinaries} =
        await targetCompiler.compile(testTarget.sourceFiles, {working_dir});

    if(targetCompilerResult.exitCode !== 0){
        await sandbox.stop();
        return {targetCompilerResult};
    }

    const objcopy = new Objcopy(sandbox);
    await objcopy.redefine_sym(targetBinaries, "main", config.testing.hijack_main, {working_dir});

    const specCompiler = new Compiler(sandbox, config.timeout.compilation);
    const {exec: specCompilerResult, obj: specBinaries} =
        await specCompiler.compile([testSpec.specFile],
            {working_dir, I: ["/opt/nitori/"], include: ["/opt/nitori/testing.hpp"]});

    if(specCompilerResult.exitCode !== 0){
        await sandbox.stop();
        return {targetCompilerResult, specCompilerResult};
    }

    const {exec: linkerResult, output} = await targetCompiler.link(
        [...targetBinaries, ...specBinaries]
    );

    if(linkerResult.exitCode !== 0){
        await sandbox.stop();
        return {targetCompilerResult, specCompilerResult, linkerResult};
    }

    const runnerResult = await sandbox.exec(["./" + output], {
        timeout: config.timeout.run
    });

    sandbox.stop().catch((...args) => debug(...args));

    return {targetCompilerResult, specCompilerResult, linkerResult, runnerResult};
};