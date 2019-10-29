const debug = require('debug')('nitori');
const config = require('chen.js').config('.config.js').resolve();

const databaseInit = require('./database/init');
const {precompileTests} = require('./precompileTests');
const {API} = require('./api');

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

(async () => {
    await databaseInit(config);
    await precompileTests(config);
    API(config);
})();