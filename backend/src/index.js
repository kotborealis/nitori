const debug = require('debug')('nitori');
const args = require('chen.js').args();
const config = require('chen.js').config('.config.js').resolve();

const {Docker} = require('node-docker-api');
const {Sandbox} = require('./Sandbox');

process.on('unhandledRejection', (reason) => debug('unhandledRejection', reason));

if(args.precompile){
    (async () => {
        await require('./precompileTests').precompileTests(config);
        process.exit(0);
    })();
}
else if(args.api){
    require('./api').API(config);
}
else{
    console.log(`Usage:
--precompile --- precompile tests from "testing.dir"
--api --- run rest-api server

--config=...path --- run with specified config
`);
}