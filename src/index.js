const config = require('./config');
const fs = require('fs');

const {Docker} = require('node-docker-api');
const {promisifyMultiplexedDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

const docker = new Docker(config.docker);

const source_file = `
#include <iostream>

int main(int argc, char** argv){
    std::cout << "Hello, World!" << std::endl;
    return 100;
}
`;

(async () => {
    const container = await docker.container.create(config.container);

    const tarball = tar.pack();
    tarball.entry({name: 'main.cpp'}, source_file);
    tarball.entry({name: 'catch.hpp'}, fs.readFileSync('./shared/lib/catch.hpp'));
    tarball.entry({name: 'test.cpp'}, fs.readFileSync('./shared/test/test1.cpp'));
    tarball.finalize();

    await container.fs.put(tarball, {
        path: '/sandbox'
    });

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
        return promisifyMultiplexedDockerStream(stream);
    };

    console.log((await exec(["g++", "--std=c++11", "test.cpp"], true)).stdout);
    console.log((await exec(["./a.out"], true)).stdout);

    await container.stop();
    await container.delete();
})();