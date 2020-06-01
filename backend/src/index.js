const debug = require('debug')('nitori');
const config = require('chen.js').config('.config.js');

const {init: databaseInit} = require('./database/');
const {API} = require('./api');

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

(async () => {
    databaseInit(config);
    API(config);
})();
