const config = require('chen.js').config('.config.js');
const {Docker} = require('node-docker-api');
const {Sandbox} = require('../Sandbox/Sandbox');
const Compiler = require('./Compiler');
const Objcopy = require('./Objcopy');

const docker = new Docker(config.docker);

describe('Compiler - c++ compile ', () => {
    let sandbox, compiler;

    beforeAll(async () => {
        sandbox = new Sandbox(docker, config);
        await sandbox.start();
        compiler = new Compiler(sandbox, 60000, "g++");
        objcopy = new Objcopy(sandbox);
    }, 60000);

    test('Objcopy --redefine-sym', async () => {
        await compiler.compile(
            [
                {
                    name: 'main.cpp',
                    content: 'int main() { return 42; }'
                }
            ], {working_dir: '/sandbox'}
        );

        const {
            exec: [{
                exitCode,
                stdout,
                stderr
            }]
        } = await objcopy.redefine_sym('main.o', 'main', '__broken__', {working_dir: '/sandbox/'});

        expect(exitCode).toEqual(0);
    }, 60000);
});