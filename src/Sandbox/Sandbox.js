const debug = require('debug')('nitori-sandbox');

const {
    promisifyDockerStream: parseDStream,
    promisifyMultiplexedDockerStream: parseDMStream
} = require('../utils/dockerStreamParser');

/**
 * Docker Sandbox class
 */
class Sandbox {
    docker;
    config;
    container;

    /**
     * Constructor
     * @param docker Docker instance
     * @param config Configuration
     */
    constructor(docker, config) {
        this.docker = docker;
        this.config = config;
    }

    /**
     * Create & start container
     * @returns {Promise<void>}
     */
    async start() {
        const {docker, config} = this;

        this.container = await docker.container.create(config.container);
        await this.container.start();
    };

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    async stop() {
        const {container} = this;
        await container.stop();
        await container.delete();
    };

    /**
     * Execute command in container
     * @param cmd Command, array
     * @param root Run as root?
     * @param tty Allocate tty?
     * @param working_dir
     * @returns {Promise<{stdout, exitCode: *, stderr}>}
     */
    async exec(cmd = [], {root = false, tty = true, working_dir = ''} = {}) {
        const {container} = this;

        debug("Exec:", cmd);

        const exec = await container.exec.create({
            WorkingDir: working_dir ? working_dir : undefined,
            Cmd: cmd,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: tty,
            User: root ? "root" : "sandbox"
        });

        const dockerStream = await exec.start();
        const {stdout, stderr} = await (tty ? parseDStream : parseDMStream)(dockerStream);
        const {data: {ExitCode: exitCode}} = await exec.status();

        debug("Exec exitCode:", exitCode);
        debug("Exec stdout:", stdout);
        debug("Exec stderr:", stderr);

        return {exitCode, stdout, stderr};
    };

    /**
     * Unpack tarball stream into specified path
     * @param tarball
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_put(tarball, path = '/') {
        return this.container.fs.put(tarball, {path});
    }

    /**
     * Get tarball from specified path
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_get(path) {
        return this.container.fs.get({path});
    }
}

module.exports = {Sandbox};