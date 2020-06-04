const {PromiseTimeout} = require('../utils/PromiseTimeout');
const debug = require('debug')('nitori:sandbox');

const shortid = require('shortid');
const {PromiseTimeoutError} = require('../utils/PromiseTimeout');

const {promisifyDockerStream} = require('../utils/promisifyDockerStream');

const instanceId = shortid.generate();

/**
 * Docker Sandbox class
 */
class Sandbox {
    /**
     * Docker instance
     */
    docker;

    /**
     * Sandbox configuration
     */
    config;

    /**
     * Sandbox container
     */
    container;

    /**
     * Sandbox ID
     */
    id;

    /**
     * debug instance associated with this Sandbox
     */
    debug;

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
        this.debug = debug.extend(this.id);
    }

    /**
     * Get all containers created by this instance
     * @param docker
     * @returns {Promise<void>}
     */
    static get_children_containers(docker) {
        return docker.container.list({
            all: true,
            filters: JSON.stringify({
                label: [`nitori.parent=${instanceId}`]
            })
        });
    }

    /**
     * Destroy all containers created by this instance
     * @param docker
     * @returns {Promise<void>}
     */
    static async destroy_all(docker) {
        debug("Destroying all created Sandbox containers");

        const containers = await Sandbox.get_children_containers(docker);

        debug(`Destroying ${containers.length} containers`);

        for await (let container of containers){
            await container.pause();

            const {data: {Name, Image, State: {Status}}} = await container.status();
            debug("Killing container", Name, Image, Status);

            try{
                await container.kill();
            }
            catch(e){
                debug("Error during container.kill()", e);
            }

            try{
                await container.delete();
            }
            catch(e){
                debug("Error during container.delete()", e);
            }
        }
    }

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    async stop() {
        this.debug("Stop sandbox & delete container");

        if(!this._running){
            this.debug("Already not running");
            return;
        }

        const {container} = this;
        try{
            await container.delete({force: true});
        }
        catch(e){
            this.debug("Error during container.delete()", e);
        }

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

        this.debug(`Execute \`${cmd.join(' ')}\` in \`${working_dir}\` with timeout \`${timeout}\``);

        try{
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
            const {stdout, stderr} = await PromiseTimeout(promisifyDockerStream(dockerStream), timeout);
            const {data: {ExitCode: exitCode}} = await exec.status();

            this.debug(`Exec exitCode=\`${exitCode}\``);
            this.debug("Exec stdout:", stdout);
            this.debug("Exec stderr:", stderr);

            // handle SIGSEGV via exitCode
            if(exitCode === '139'){
                return {
                    exitCode,
                    stdout: stdout + `\nAbort (segmentation fault)\n`,
                    stderr
                };
            }

            return {exitCode, stdout, stderr};
        }
        catch(e){
            if(e instanceof PromiseTimeoutError){
                this.debug(`Exec timed out in ${timeout}ms.`);
                await this.stop();
                // 124 is exit code for timeout command
                return {exitCode: 124, stdout: e.message, stderr: ""};
            }
            else{
                this.debug("Error while executing", e);
            }
        }
    };

    /**
     * Unpack tarball stream into specified path
     * @param tarball
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_put(tarball, path = '/') {
        this.debug("Fs put into", path);
        return this.container.fs.put(tarball, {path});
    }

    /**
     * Get tarball from specified path
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_get(path) {
        this.debug("Fs get from", path);
        return this.container.fs.get({path});
    }

    /**
     * Create & start container
     * @returns {Promise<void>}
     */
    async start() {
        this.debug("Start");

        if(this._running){
            this.debug("Already running");
            return;
        }

        const {docker, config, id} = this;

        try{
            this.container = await docker.container.create({
                ...config.container,
                name: `${config.sandbox.container_prefix}${id}`,
                Labels: {
                    "nitori.sandbox": id,
                    "nitori.parent": instanceId
                }
            });

            await this.container.start();
        }
        catch(e){
            this.debug("Error while creating/starting container", e);
        }

        this._running = true;
    };
}

module.exports = {Sandbox};