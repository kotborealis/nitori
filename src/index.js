const args = require('chen.js').args();
const config = require('chen.js').config('.config.js').resolve();

if(args.precompile){
    require('./precompileTests').precompileTests(config);
}
else if(args.api){
    require('./api/').API(config);
}
else{
    console.log(`Usage:
--precompile --- precompile tests from "testing.dir"
--api --- run rest-api server

--config=...path --- run with specified config
`);
}