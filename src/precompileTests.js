require('debug').enable("nitori*");
const debug = require('debug')('nitori:precompileTests');

const {fs} = require('./utils/async-fs');
const glob = require('./utils/async-glob');
const path = require('path');

const md5 = require('md5');

const {Docker} = require('node-docker-api');
const {Sandbox} = require('./Sandbox');
const {ObjectCache} = require('./ObjectCache');
const {Compiler} = require('./gnu_utils');

const precompileTests = async (config) => {
    const working_dir = config.sandbox.working_dir;

    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const compiler = new Compiler(sandbox, config.timeout.precompilation);

    const tests = await glob(path.join(config.testing.dir, '/**/*'));

    for await (const test of tests) {
        debug("Precompile test", test);

        const content = await fs.readFile(test);

        const cache_key = md5(content);

        if(objectCache.has(cache_key)){
            debug(`Test ${test} already precompiled, skipping...`);
            continue;
        }

        const {exec: {exitCode}} = await compiler.compile(
            [{name: config.testing.test_src_name, content}],
            {working_dir, I: ["/opt/nitori/"]}
        );

        if(exitCode){
            debug("Failed to precompile test", test);
            const err = new Error(`Failed to compile test ${test}`);
            err.exec = exec;
            throw err;
        }

        const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_obj_name);
        objectCache.put(cache_key, testObjStream);
        debug(`Precompiled test ${test} with cache key ${cache_key}`);
    }

    debug("Precompiled all tests");

    await sandbox.stop();
};

module.exports = {precompileTests};