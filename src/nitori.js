const fs = require('fs');
const debug = require('debug')('nitori-lib');

const {Docker} = require('node-docker-api');
const {promisifyDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

async function exec(container, cmd = []) {
    debug("Executing cmd", cmd);

    const command = await container.exec.create({
        Cmd: cmd,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        User: "root"
    });

    const dockerStream = await command.start();
    const stream = await promisifyDockerStream(dockerStream);

    const {data: {ExitCode}} = await command.status();

    debug("Cmd result", stream);
    debug("Cmd exitCode", ExitCode);

    return {
        stdout: stream,
        stderr: "",
        exitCode: ExitCode
    };
}

function libs_tarball(config) {
    const tarball_libs = tar.pack();

    ['catch.hpp', 'hijack.hpp', 'testing.hpp'].forEach(f =>
        tarball_libs.entry(
            {name: `${config.testing.libs}/${f}`},
            fs.readFileSync(`./shared/lib/${f}`)
        )
    );

    tarball_libs.finalize();
    return tarball_libs;
}

function fs_put_root(container, tarball) {
    return container.fs.put(tarball, {path: '/'});
}

const nitori = async ({
                          docker,
                          config,
                          src_files,
                          spec_file
                      }) => {

    const cpp_file_names = src_files
        .map(({name}) => name)
        .filter((name) => name.endsWith(".cpp") || name.endsWith(".c"));

    const obj_file_names = cpp_file_names
        .map(name=> name.slice(0, name.lastIndexOf(".")) + ".o");

    const container = await docker.container.create(config.container);

    const tarball_code = tar.pack();
    src_files.forEach(({name, content}) => {
        tarball_code.entry({name: `/sandbox/${name}`}, content);
    });
    tarball_code.entry({name: `${config.testing.libs}/test.cpp`}, spec_file);
    tarball_code.finalize();

    await container.fs.put(tarball_code, {path: '/'});
    await fs_put_root(container, tarball_code);

    const tarball_libs = libs_tarball(config);
    await fs_put_root(container, tarball_libs);

    await container.start();

    const output = {
        compilation: [],
        test: []
    };

    for await (let name of cpp_file_names) {
        output.compilation.push(await exec(container,[
            "g++", `--std=${config.sandbox.std_version}`, "-c", name
        ]));
    }

    if(!output.compilation.every(({exitCode}) => exitCode === 0)){
        return output;
    }

    for await (let name of obj_file_names) {
        await exec(container,[
            "objcopy",
            name,
            "--redefine-sym", `main=${config.testing.hijack_main}`
        ]);
    }

    await exec(container,[
        "g++",
        `-I${config.testing.libs}`,
        `--std=${config.sandbox.std_version}`,
        "-c", "-o", "test.o",
        `${config.testing.libs}/test.cpp`
    ]);

    await exec(container,[
        "g++",
        "-o", "test_runner",
        ...obj_file_names,
        "test.o"
    ]);

    output.test.push(await exec(container,[
        "./test_runner", "-s"
    ]));

    await container.stop();
    await container.delete();

    return output;
};

module.exports = nitori;