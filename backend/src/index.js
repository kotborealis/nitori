const config = require('chen.js').config('.config.js');
require('./logging/logger').init(config);

const {init: databaseInit} = require('./database/');
const {API} = require('./api');
const {Docker} = require('node-docker-api');
const {Sandbox} = require('./Sandbox');

process.on('unhandledRejection', (reason) => console.error('unhandledRejection', reason));

(async () => {
    Sandbox.build(new Docker(config.docker), config);
    databaseInit(config);
    API(config);
})();
