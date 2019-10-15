const args = require('chen.js').args();
const config = require('chen.js').config('.config.js').resolve();

if(args.precompile){
    require('./precompileTests')(config);
}
else if(args.api) {
    require('./api/').API(config);
}
else if(args.src && args.spec){
    const md5 = require('md5');

    const fs = require('fs');
    const {Docker} = require('node-docker-api');

    const {Sandbox} = require('./Sandbox/');
    const {ObjectCache} = require('./ObjectCache');
    const {Compiler, Objcopy} = require('./gnu_utils/');

    const docker = new Docker(config.docker);

    const src_file_content = fs.readFileSync(args.src);

    const spec_file_name = args.spec;
    const spec_file_content = fs.readFileSync(spec_file_name);
    const spec_file_key = md5(spec_file_content);

    const sandbox = new Sandbox(docker, config);
    const objectCache = new ObjectCache(config.cache.dir);
    const compiler = new Compiler(sandbox);
    const objcopy = new Objcopy(sandbox);

    (async () => {
        const working_dir = config.sandbox.working_dir;

        console.log("Starting sandbox...");
        await sandbox.start();

        console.log("Compiling target...");
        const {exec: targetCompilation, obj: targetObj} = await compiler.compile_obj(
            [{name: "main.cpp", content: src_file_content}],
            {working_dir}
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
        await objcopy.redefine_sym(targetObj, "main", config.testing.hijack_main, {working_dir});
        console.log("Hijacked main via objcopy!");


        if(objectCache.has(spec_file_key)){
            console.log("Loading tests from cache...");
            await sandbox.fs_put(objectCache.get(spec_file_key), working_dir);
            console.log("Loaded tests from cache!");
        }
        else{
            console.log("Compiling tests...");
            const {exec: testCompilation} = await compiler.compile_obj(
                [{name: config.testing.test_src_name, content: spec_file_content}],
                {working_dir}
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

                const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_obj_name);
                objectCache.put(spec_file_key, testObjStream);
            }
        }

        console.log("Linking test and target...");
        const {exec: exeCompilation, output} = await compiler.compile_exe_from_obj(
            [...targetObj, config.testing.test_obj_name]
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

}