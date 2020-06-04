const config = require('chen.js').config('.config.js');
const {Docker} = require('node-docker-api');
const {Sandbox} = require('../Sandbox/Sandbox');
const Compiler = require('./Compiler');

const docker = new Docker(config.docker);

describe('Compiler - c++ compile ', () => {
    let sandbox, compiler;

    beforeAll(async () => {
        sandbox = new Sandbox(docker, config);
        await sandbox.start();
        compiler = new Compiler(sandbox, 60000, "g++");
    }, 60000);

    test('Object file compilation', async () => {
        const {
            obj,
            exec: {
                exitCode,
                stdout,
                stderr
            }
        } = await compiler.compile(
            [
                {
                    name: 'main.cpp',
                    content: 'int main() { return 42; }'
                }
            ], {working_dir: '/sandbox'}
        );

        expect(exitCode).toEqual(0);
        expect(obj).toMatchObject(['main.o']);

        expect(await sandbox.fs_get('/sandbox/main.o')).toBeTruthy();
    }, 60000);

    test('Program linking', async () => {
        const {
            output,
            exec: {
                exitCode,
                stdout,
                stderr
            }
        } = await compiler.link(['main.o'], {working_dir: '/sandbox'});

        expect(exitCode).toEqual(0);
        expect(output).toEqual('a.out');

        expect(await sandbox.fs_get('/sandbox/a.out')).toBeTruthy();

        expect((await sandbox.exec(['/sandbox/a.out'])).exitCode).toEqual(42);
    });
});