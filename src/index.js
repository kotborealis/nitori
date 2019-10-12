const config = require('./config');
const args = require('chen.js').args();

const fs = require('fs');

const {Docker} = require('node-docker-api');
const {promisifyDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

const docker = new Docker(config.docker);

if(!args.src) {
    console.error("No --src file specified!");
    process.exit(1);
}

if(!args.spec) {
    console.error("No --spec file specified!");
    process.exit(1);
}

const src_file = fs.readFileSync(args.src);
const spec_file = fs.readFileSync(args.spec);

(async () => {
    const container = await docker.container.create(config.container);

    const tarball_code = tar.pack();
    tarball_code.entry({name: '/sandbox/main.cpp'}, src_file);
    tarball_code.entry({name: `${config.testing.libs}/test.cpp`}, spec_file);
    tarball_code.finalize();

    await container.fs.put(tarball_code, {path: '/'});

    const tarball_libs = tar.pack();

    ['catch.hpp', 'hijack.hpp', 'testing.hpp'].forEach(f =>
        tarball_libs.entry(
            {name: `${config.testing.libs}/${f}`},
            fs.readFileSync(`./shared/lib/${f}`)
        )
    );

    tarball_libs.finalize();

    await container.fs.put(tarball_libs, {path: '/'});

    await container.start();

    const exec = async (cmd = [], root = false) => {
        const command = await container.exec.create({
            Cmd: cmd,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            User: root ? "root" : "sandbox"
        });
        const stream = await command.start();
        return promisifyDockerStream(stream);
    };

    console.log((await exec([
        "g++",
        `--std=${config.sandbox.std_version}`,
        "-c",
        "-o", "main.o",
        "main.cpp"
    ], true)));

    console.log((await exec([
        "objcopy",
        "main.o",
        "--redefine-sym", `main=${config.testing.hijack_main}`
    ], true)));

    console.log((await exec([
        "g++",
        `-I${config.testing.libs}`,
        `--std=${config.sandbox.std_version}`,
        "-c", "-o", "test.o",
        `${config.testing.libs}/test.cpp`
    ], true)));

    console.log((await exec([
        "g++",
        "-o", "test_runner",
        "main.o",
        "test.o"
    ], true)));

    console.log((await exec([
        "./test_runner", "-s"
    ], true)));

    await container.stop();
    await container.delete();
})();