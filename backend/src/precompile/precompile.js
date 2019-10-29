require('debug').enable("nitori*");
const debug = require('debug')('nitori:precompile_all');

const db_utils = require('../database/utils');

const md5 = require('md5');

const {Docker} = require('node-docker-api');
const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler} = require('../gnu_utils');

const precompile = async (config, id) => {
    debug("Test precompilation for", id);

    const tasks_db = require('nano')(config.database).use("tasks");
    const working_dir = config.sandbox.working_dir;

    const docker = new Docker(config.docker);
    const objectCache = new ObjectCache(config.cache.dir);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const compiler = new Compiler(sandbox, config.timeout.precompilation);

    const content = await db_utils.getFirstAttachment(tasks_db, id);

    const cache_key = md5(content);

    debug("cache key", cache_key);

    if(objectCache.has(cache_key)){
        debug(`Test ${id} already precompiled, skipping...`);
        return;
    }

    debug("Compiling");

    const {exec: {exitCode}} = await compiler.compile(
        [{name: config.testing.test_src_name, content}],
        {working_dir, I: ["/opt/nitori/"]}
    );

    debug("Compiled");

    if(exitCode){
        debug("Failed to precompile_all test", id);
        const err = new Error(`Failed to compile test ${id}`);
        err.exec = exec;
        throw err;
    }

    const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_obj_name);
    objectCache.put(cache_key, testObjStream);
    debug(`Precompiled test ${id} with cache key ${cache_key}`);

    await sandbox.stop();
};

const precompile_all = async (config) => {
    debug("Start tests precompilation");

    const tasks_db = require('nano')(config.database).use("tasks");
    const {rows} = await tasks_db.view("task", "by_wid");
    const tests = rows.map(({value: {_id}}) => _id);

    for await (const test of tests) await precompile(config, test);

    debug("Precompiled all tests");
};

module.exports = {precompile_all, precompile};