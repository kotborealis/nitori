const debug = require('debug')('nitori');
const config = require('chen.js').config('.config.js').resolve();

const databaseInit = require('./database/init');
const {precompile_all} = require('./TestSpecPrecompile/precompile');
const {API} = require('./api');

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

(async () => {
    await databaseInit(config);
    await precompile_all(config);
    API(config);
})();
