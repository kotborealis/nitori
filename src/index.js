const config = require('./config');
const args = require('chen.js').args();

const fs = require('fs');

const {Docker} = require('node-docker-api');
const {promisifyDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

const nitori = require('./nitori');

const docker = new Docker(config.docker);

if(!args.src) {
    console.error("No --src file specified!");
    process.exit(1);
}

if(!args.spec) {
    console.error("No --spec file specified!");
    process.exit(1);
}

const src_file = fs.readFileSync(args.src);
const spec_file = fs.readFileSync(args.spec);

(async () => {
    const {compilation, test} = await nitori({
        docker,
        config,
        src_files: [{name: "main.cpp", content: src_file}],
        spec_file: spec_file
    });

    console.log(`Compilation log:`);
    compilation.forEach(({stdout}) => console.log(stdout));
    console.log(`Test runner log:`);
    test.forEach(({stdout}) => console.log(stdout));
})();