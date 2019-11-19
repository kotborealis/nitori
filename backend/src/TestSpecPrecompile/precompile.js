require('debug').enable("nitori*");
const debug = require('debug')('nitori:precompile_all');

const db_utils = require('../database/utils');

const md5 = require('md5');

const {Docker} = require('node-docker-api');
const {Sandbox} = require('../Sandbox');
const {ObjectCache} = require('../ObjectCache');
const {Compiler} = require('../gnu_utils');

const precompile = async (config, id) => {
    debug("TestSpec precompilation for", id);

    const db = require('nano')(config.database).use(config.database.name);
    const working_dir = config.sandbox.working_dir;

    const objectCache = new ObjectCache(config.cache.dir);

    const content = await db_utils.getFirstAttachment(db, id);

    const cache_key = md5(content);

    debug("cache key", cache_key);

    if(objectCache.has(cache_key)){
        debug(`Test ${id} already precompiled, skipping...`);
        return {exitCode: 0, stdout: "Loaded from cache", stderr: ""};
    }

    debug("Compiling");

    const docker = new Docker(config.docker);
    const sandbox = new Sandbox(docker, config);
    await sandbox.start();

    const compiler = new Compiler(sandbox, config.timeout.precompilation);

    const {exec} = await compiler.compile(
        [{name: config.testing.test_src_name, content}],
        {working_dir, I: ["/opt/nitori/"]}
    );

    debug("Compiled");

    if(exec.exitCode){
        return exec;
    }

    const testObjStream = await sandbox.fs_get(working_dir + "/" + config.testing.test_obj_name);
    objectCache.put(cache_key, testObjStream);
    debug(`Precompiled test ${id} with cache key ${cache_key}`);

    await sandbox.stop();

    return exec;
};

const precompile_all = async (config) => {
    debug("Start TestSpecs precompilation");

    const db = require('nano')(config.database).use(config.database.name);
    const {rows} = await db.view("TestSpec", "by_wid", {include_docs: true});
    const tests = rows.map(({value: {_id}}) => _id);

    for await (const test of tests) await precompile(config, test);

    debug("Precompiled all TestSpecs");
};

module.exports = {precompile_all, precompile};