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
    await Promise.all(`exit _exit _Exit abort quick_exit`.split(' ').map(fn =>
        objcopy.redefine_sym(targetBinaries, fn, config.testing.hijack_exit, {working_dir})
    ));

    const includePaths = testTarget.sourceFiles
        .map(({name}) => require('path').dirname(name))
        .filter((element, index, self) => self.indexOf(element) === index);

    const specCompiler = new Compiler(sandbox, config.timeout.compilation);
    const {exec: specCompilerResult, obj: specBinaries} =
        await specCompiler.compile([testSpec.specFile],
            {working_dir, I: ["/opt/nitori/", ...includePaths], include: ["/opt/nitori/testing.hpp"]});

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

    const runnerResult = await sandbox.exec(["valgrind", `--log-file=/sandbox/.valgrind`, `./${output}`], {
        timeout: config.timeout.run
    });

    const valgrindResult = await sandbox.exec([`cat`, `/sandbox/.valgrind`]);

    runnerResult.stdout += `valgrind memcheck:\n\n` + valgrindParser(config, valgrindResult.stdout);

    sandbox.stop().catch((...args) => logger.error(...args));

    return {specCompilerResult, targetCompilerResult, linkerResult, runnerResult};
};

const valgrindParser = (config, output) => {
    output = output
        .split('\n')
        .map(str => str.replace(/^==\d+== /i, '').trim());

    output = output.slice(output.indexOf(``) + 1);
    const valgrindCrashIndex = output.findIndex(str => str.indexOf(`-- VALGRIND INTERNAL ERROR:`) > 2);
    if(valgrindCrashIndex !== -1)
        output = output.slice(0, valgrindCrashIndex);

    output = output
        .map(str => str.replace(new RegExp(config.testing.hijack_main, 'g'), 'main'));

    return output.join('\n');
};