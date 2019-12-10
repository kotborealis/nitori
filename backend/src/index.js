const debug = require('debug')('nitori');
const config = require('chen.js').config('.config.js').resolve();

const databaseInit = require('./database/init');
const {precompileTestSpecs} = require('./TestSpec/compileTestSpec');
const {API} = require('./api');

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

(async () => {
    await databaseInit(config);
    await precompileTestSpecs(config);
    API(config);
})();
