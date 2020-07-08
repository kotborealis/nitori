const config = require('chen.js').config('.config.js');
require('./logging/logger').init(config);

const {init: databaseInit} = require('./database/');
const {API} = require('./api');

process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));

(async () => {
    databaseInit(config);
    API(config);
})();
