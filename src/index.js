const args = require('chen.js').args();

const fs = require('fs');
const {Docker} = require('node-docker-api');

const {Sandbox} = require('./Sandbox/');
const {Compiler, Objcopy} = require('./gnu_utils/');

const config = require('./config');
const docker = new Docker(config.docker);

if(!args.src) {
    console.error("No --src file specified!");
    process.exit(1);
}

if(!args.spec) {
    console.error("No --spec file specified!");
    process.exit(1);
}

const src_file = fs.readFileSync(args.src);
const spec_file = fs.readFileSync(args.spec);

const sandbox = new Sandbox(docker, config);
const compiler = new Compiler(sandbox);
const objcopy = new Objcopy(sandbox);

(async () => {
    console.log("Starting sandbox...");
    await sandbox.start();

    console.log("Compiling target...");
    const {exec: targetCompilation, obj: targetObj} = await compiler.compile_obj(
        [{name: "main.cpp", content: src_file}]
    );

    if(targetCompilation.exitCode !== 0){
        console.error("Compilation of target failed!");
        console.log(targetCompilation.stdout);

        await sandbox.stop();
        process.exit(1);
    }
    else{
        console.log("Compilation of target succeeded!");
        console.log(targetCompilation.stdout);
    }

    console.log("Hijacking main via objcopy...");
    await objcopy.redefine_sym(targetObj, "main", config.testing.hijack_main);
    console.log("Hijacked main via objcopy!");

    console.log("Compiling tests...");
    const {exec: testCompilation, obj: testObj} = await compiler.compile_obj(
        [{name: "test.cpp", content: spec_file}]
    );

    if(testCompilation.exitCode !== 0){
        console.error("Compilation of test failed!");
        console.log(testCompilation.stdout);

        await sandbox.stop();
        process.exit(1);
    }
    else{
        console.log("Compilation of test succeeded!");
        console.log(testCompilation.stdout);
    }

    console.log("Linking test and target...");
    const {exec: exeCompilation, output} = await compiler.compile_exe_from_obj(
        [...targetObj, ...testObj]
    );

    if(exeCompilation.exitCode !== 0){
        console.error("Compilation of exe failed!");
        console.log(exeCompilation.stdout);

        await sandbox.stop();
        process.exit(1);
    }
    else{
        console.log("Compilation of exe succeeded!");
        console.log(exeCompilation.stdout);
    }

    const exec = await sandbox.exec(["./" + output, "-s"]);
    console.log("Runner log:", exec.stdout);
})();