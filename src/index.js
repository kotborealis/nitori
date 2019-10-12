const config = require('./config');
const fs = require('fs');

const {Docker} = require('node-docker-api');
const {promisifyDockerStream} = require('./dockerStreamUtils');

const tar = require('tar-stream');

const docker = new Docker(config.docker);

const source_file = `
#include <iostream>

int main(){
    std::string s(std::istreambuf_iterator<char>(std::cin), {});
    std::cout << s;
}
`;

(async () => {
    const container = await docker.container.create(config.container);

    const tarball = tar.pack();
    tarball.entry({name: 'main.cpp'}, source_file);
    tarball.entry({name: 'test.cpp'}, fs.readFileSync('./shared/test/test_cat.cpp'));
    tarball.finalize();

    await container.fs.put(tarball, {
        path: '/sandbox'
    });

    const tarball_libs = tar.pack();
    tarball_libs.entry({name: 'nitori-testing/catch.hpp'}, fs.readFileSync('./shared/lib/catch.hpp'));
    tarball_libs.entry({name: 'nitori-testing/hijack.hpp'}, fs.readFileSync('./shared/lib/hijack.hpp'));
    tarball_libs.entry({name: 'nitori-testing/testing.hpp'}, fs.readFileSync('./shared/lib/testing.hpp'));
    tarball_libs.finalize();

    await container.fs.put(tarball_libs, {
        path: '/opt/'
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
        return promisifyDockerStream(stream);
    };

    console.log((await exec(["g++", "--std=c++11", "-c", "-o", "main.o", "main.cpp"], true)));
    console.log((await exec(["objcopy", "main.o", "--redefine-sym", "main=__HIJACK_MAIN__"], true)));

    console.log((await exec(["g++", "-I/opt/nitori-testing", "--std=c++11", "-c", "-o", "test.o", "test.cpp"], true)));

    console.log((await exec(["g++", "-o", "test_runner", "main.o", "test.o"], true)));
    console.log((await exec(["./test_runner", "-s"], true)));

    await container.stop();
    await container.delete();
})();