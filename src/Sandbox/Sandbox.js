const {PromiseTimeout} = require('../utils/PromiseTimeout');
const debug = require('debug')('nitori:sandbox');

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
        debug("Start sandbox");
        const {docker, config} = this;

        this.container = await docker.container.create(config.container);
        await this.container.start();
    };

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    async stop() {
        debug("Stop sandbox");
        const {container} = this;
        await container.kill();
        await container.delete();
    };

    /**
     * Execute command in container
     * @param cmd Command, array
     * @param root Run as root?
     * @param tty Allocate tty?
     * @param working_dir Set working dir
     * @param timeout Exec timeout
     * @returns {Promise<{stdout, exitCode: *, stderr}>}
     */
    async exec(cmd = [], {root = false, tty = true, working_dir = '', timeout = 100000} = {}) {
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


        try{
            const dockerStream = await exec.start();
            const {stdout, stderr} = await PromiseTimeout((tty ? parseDStream : parseDMStream)(dockerStream), timeout);
            const {data: {ExitCode: exitCode}} = await exec.status();

            debug("Exec exitCode:", exitCode);
            debug("Exec stdout:", stdout);
            debug("Exec stderr:", stderr);

            return {exitCode, stdout, stderr};
        }
        catch({message, stack}){
            debug(stack);
            debug("Timed out sandbox will be terminated.");
            await this.stop();
            // 124 is exit code for timeout command
            return {exitCode: 124, stdout: "message", stderr: ""};
        }
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