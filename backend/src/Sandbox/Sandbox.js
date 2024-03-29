const {PromiseTimeout} = require('../utils/PromiseTimeout');

const logger = require(('../logging/logger')).logger('Sandbox');

const shortid = require('shortid');
const {PromiseTimeoutError} = require('../utils/PromiseTimeout');

const {promisifyDockerStream} = require('../utils/promisifyDockerStream');

const tar = require('tar-fs');

const EventEmmiter = require('events').EventEmitter;

const instanceId = shortid.generate();

/**
 * Docker Sandbox class
 */
class Sandbox extends EventEmmiter {
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

    static registry = new Map;

    /**
     * Constructor
     * @param docker Docker instance
     * @param config Configuration
     */
    constructor(docker, config) {
        super();
        this.docker = docker;
        this.config = config;
        this.id = shortid.generate();

        Sandbox.registry.set(this.id, this);

        logger.info('Sandbox started', {id: this.id, config});
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
        logger.info("Destroying all created Sandbox containers", {instanceId});

        const containers = await Sandbox.get_children_containers(docker);

        logger.info(`Destroying ${containers.length} containers`);

        for await (let container of containers){
            await container.pause();

            const {data: {Name, Image, State: {Status}}} = await container.status();
            logger.info("Killing container", {Name, Image, Status});

            try{
                await container.kill();
            }
            catch(e){
                logger.error("Error during container.kill()", e);
            }

            try{
                await container.delete();
            }
            catch(e){
                logger.error("Error during container.delete()", e);
            }
        }
    }

    static build(docker, config) {
        logger.info("Building sandbox image");
        const tarball = tar.pack(config.container.imageContextPath);
        return new Promise((resolve, reject) =>
            docker.image.build(tarball, {t: config.container.Image})
                .then(promisifyDockerStream)
                .then(() => docker.image.get(config.container.Image).status())
                .then((...args) => {
                    logger.info("Successfully built sandbox image");
                    resolve(...args);
                })
                .catch((...args) => {
                    logger.error("Failed to build sandbox image");
                    reject(...args);
                })
        );
    }

    /**
     * Stop & remove container
     * @returns {Promise<void>}
     */
    async stop() {
        Sandbox.registry.delete(this.id);
        logger.debug("Stop sandbox & delete container", {id: this.id});

        if(!this._running){
            logger.debug("Already not running", {id: this.id});
            return;
        }

        const {container} = this;
        try{
            await container.delete({force: true});
        }
        catch(e){
            logger.error("Error during container.delete()", e);
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

        logger.debug(`Execute \`${cmd.join(' ')}\` in \`${working_dir}\` with timeout \`${timeout}\``, {id: this.id});

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

            const dockerStream = await exec.start({hijack: true, stdin: true});
            const {stdout, stderr} = await PromiseTimeout(promisifyDockerStream(dockerStream, exec, this), timeout);
            const {data: {ExitCode: exitCode}} = await exec.status();

            logger.debug(`exec result`, {id: this.id, exitCode, stdout, stderr});

            // handle SIGSEGV via exitCode
            if(exitCode === '139'){
                logger.info(`handled sigsegv (return 139)`);
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
                logger.info(`Exec timed out in ${timeout}ms.`, {id: this.id});
                await this.stop();
                // 124 is exit code for timeout command
                return {exitCode: 124, stdout: e.message, stderr: ""};
            }
            else{
                logger.error("Error while executing", e);
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
        logger.debug("Fs put into", {path});
        return this.container.fs.put(tarball, {path});
    }

    /**
     * Get tarball from specified path
     * @param path
     * @returns {Promise<Object>}
     */
    async fs_get(path) {
        logger.debug("Fs get from", {path});
        return this.container.fs.get({path});
    }

    /**
     * Create & start container
     * @returns {Promise<void>}
     */
    async start() {
        logger.debug("Start");

        if(this._running){
            logger.debug("Already running");
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
            logger.error("Error while creating/starting container", e);
        }

        this._running = true;
    };

    stdout(str) {
        this.emit('stdout', str);
    }
}

module.exports = {Sandbox};