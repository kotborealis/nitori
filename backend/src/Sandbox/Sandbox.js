const {PromiseTimeout} = require('../utils/PromiseTimeout');
const debug = require('debug')('nitori:sandbox');

const shortid = require('shortid');

const {promisifyDockerStream} = require('../utils/promisifyDockerStream');

const instanceId = shortid.generate();

/**
 * Docker Sandbox class
 */
class Sandbox {
    docker;
    config;
    container;
    id;

    _running = false;

    /**
     * Constructor
     * @param docker Docker instance
     * @param config Configuration
     */
    constructor(docker, config) {
        this.docker = docker;
        this.config = config;
        this.id = shortid.generate();
    }

    /**
     * Destroy all containers, created by this instance
     * @param docker
     * @returns {Promise<void>}
     */
    static async destroy_all(docker) {
        debug("Destroying all created containers");

        const containers = await docker.container.list({
            all: true,
            filters: JSON.stringify({
                label: [`nitori.parent=${instanceId}`]
            })
        });

        debug(`Removing ${containers.length} containers`);

        for await (let container of containers){
            await container.pause();

            const {data: {Name, Image, State: {Status}}} = await container.status();
            debug("Processing container", Name, Image, Status);

            debug("Killing & deleting container");

            try{
                await container.kill();
            }
            catch(e){
                debug(e);
            }

            try{
                await container.delete();
            }
            catch(e){
                debug(e);
            }
        }

        debug("Done");
    }

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    async stop() {
        debug("Stop sandbox");

        if(!this._running) return;

        const {container} = this;
        await container.delete({force: true});

        this._running = false;
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
    async exec(cmd = [], {root = false, tty = true, working_dir = '', timeout = 0} = {}) {
        const {container} = this;

        debug(`Exec in ${working_dir}:`, cmd.join(' '));

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
            debug("Exec with timeout", timeout);
            const {stdout, stderr} = await PromiseTimeout(promisifyDockerStream(dockerStream), timeout);
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
            return {exitCode: 124, stdout: message, stderr: ""};
        }
    };

    /**
     * Unpack tarball stream into specified path
     * @param tarball
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_put(tarball, path = '/') {
        debug("fs put", path);
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

    /**
     * Create & start container
     * @returns {Promise<void>}
     */
    async start() {
        debug("Start sandbox");

        if(this._running) return;

        const {docker, config, id} = this;

        this.container = await docker.container.create({
            ...config.container,
            name: `${config.sandbox.container_prefix}_${id}`,
            Labels: {
                "nitori.sandbox": id,
                "nitori.parent": instanceId
            }
        });
        await this.container.start();

        this._running = true;
    };
}

module.exports = {Sandbox};