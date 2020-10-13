const config = require('chen.js').config('.config.js');
require('../../../src/logging/logger').init(config);
const {Docker} = require('node-docker-api');
const {Sandbox} = require('../../../src/Sandbox/Sandbox');

const docker = new Docker(config.docker);

describe('Sandbox', () => {
    let sandbox;

    beforeAll(async () =>
        sandbox = new Sandbox(docker, config)
    );

    test('init', () => {
        expect(sandbox.id).toBeTruthy();
        expect(sandbox.container).toBeFalsy();
        expect(sandbox.config).toBeTruthy();
        expect(sandbox._running).toBe(false);
    });

    test('start', async () => {
        await sandbox.start();
        expect(sandbox.container).toBeTruthy();
        expect(sandbox._running).toBe(true);

        const {data: status} = await sandbox.container.status();
        expect(status.State.Running).toBe(true);
        expect(status.Config.Image).toBe(config.container.Image);
    }, 60000);

    test('exec', async () => {
        const {exitCode, stdout, stderr} = await sandbox.exec([`echo`, `testing`]);
        expect(exitCode).toBe(0);
        expect(stdout).toEqual(`testing\r\n`);
        expect(stderr).toEqual(``);
    });

    test('exec timeout', async () => {
        const timeout = 500;
        const {exitCode, stdout, stderr} = await sandbox.exec(
            [`yes`, `testing`],
            {
                timeout,
            }
        );
        expect(exitCode).toBe(124);
        expect(stdout).toEqual(`Promise timed out in ${timeout}ms.`);
        expect(sandbox._running).toBe(false);
    }, 10000);

    test('stop', async () => {
        await sandbox.stop();
        expect(sandbox._running).toBe(false);
    });
});

describe('Sandbox cleanup', () => {
    test('destroy_all', async () => {
        const spawn = 5;
        await Promise.all([...Array(spawn)].map(() => (new Sandbox(docker, config)).start()));

        let children = await Sandbox.get_children_containers(docker);
        expect(children.length).toEqual(spawn);

        await Sandbox.destroy_all(docker);

        children = await Sandbox.get_children_containers(docker);
        expect(children.length).toEqual(0);
    }, 60000);
});