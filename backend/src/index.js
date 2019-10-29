const debug = require('debug')('nitori');
const config = require('chen.js').config('.config.js').resolve();

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

require('./database/init')(config);
require('./api').API(config);