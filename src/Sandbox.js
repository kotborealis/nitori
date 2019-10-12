const {parseDStream, parseDMStream} = require('./dockerStreamUtils');
const debug = require('debug')('nitori-sandbox');

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
    start = async () => {
        const {docker, config} = this;

        this.container = await docker.container.create(config.container);
        await this.container.start();
    };

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    stop = async () => {
        const {container} = this;
        await container.stop();
        await container.delete();
    };

    /**
     * Execute command in container
     * @param cmd Command, array
     * @param root Run as root?
     * @param tty Allocate tty?
     * @returns {Promise<{stdout, exitCode: *, stderr}>}
     */
    exec = async (cmd = [], {root = false, tty = true} = {}) => {
        const {container} = this;

        debug("Exec:", cmd);

        const exec = await container.exec.create({
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
     * Unpack tarball stream into `/`
     * @param tarball
     * @returns {Promise<Object>}
     */
    fs_put_root = (tarball) =>
        this.container.fs.put(tarball, {path: '/'});
}

module.exports = {Sandbox};