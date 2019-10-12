const config = require('./config');

const {Docker} = require('node-docker-api');
const {promisifyDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

const docker = new Docker(config.docker);

const source_file = `
#include <iostream.h>

int main(int argc, char** argv){
    std::cout << "Henlo world!" << std::endl;
    return 100;
}
`;

(async () => {
    const container = await docker.container.create(config.container);

    const tarball = tar.pack();
    tarball.entry({name: 'main.cpp'}, source_file);
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
            Tty: false,
            User: root ? "root" : "sandbox"
        });
        const stream = await command.start();
        return promisifyDockerStream(stream);
    };

    console.log("Compilation log: ", await exec(["g++", "main.cpp"], true));
    console.log("Runner log: ", await exec(["./a.out"]));

    await container.stop();
    await container.delete();
})();