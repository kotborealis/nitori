const config = require('chen.js').config('.config.js');
const {Docker} = require('node-docker-api');
const {Sandbox} = require('../Sandbox/Sandbox');
const Ar = require('./Ar');

const docker = new Docker(config.docker);

describe('ar - create, modify, and extract from archives', () => {
    let sandbox, ar;

    beforeAll(async () => {
        sandbox = new Sandbox(docker, config);
        await sandbox.start();
        ar = new Ar(sandbox);

        await sandbox.exec([`touch`, `/sandbox/1.bin`]);
        await sandbox.exec([`touch`, `/sandbox/2.bin`]);
        await sandbox.exec([`touch`, `/sandbox/3.bin`]);
    }, 60000);

    test('ar cr - pack', async () => {
        await ar.cr(
            "output.bin.a",
            [
                "1.bin",
                "2.bin",
                "3.bin",
            ],
            {working_dir: "/sandbox/"}
        );

        expect(await sandbox.fs_get('/sandbox/output.bin.a')).toBeTruthy();
    }, 60000);
});