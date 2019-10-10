const {Docker} = require('node-docker-api');

const promisifyStream = stream => new Promise((resolve, reject) => {
    const data = {
        stdin: "",
        stdout: "",
        stderr: ""
    };
    stream.on('data', chunk => {
        let offset = 0;

        while(chunk.length > offset) {

            const HEADER_LENGTH = 8;
            const header = chunk.slice(offset, offset + HEADER_LENGTH);
            const type = header[0];
            const length = header.readUInt32BE(4);
            const payload = chunk.slice(offset + HEADER_LENGTH, length).toString();

            if(type === 0)
                data.stdin += payload;
            else if(type === 1)
                data.stdout += payload;
            else if(type === 2)
                data.stderr += payload;

            offset += HEADER_LENGTH + length;
        }
    });
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
});

const docker = new Docker({host: "localhost", port: 2375});
(async () => {
    const container = await docker.container.create({
        Image: "nitori-sandbox",
        Tty: true,
        StopTimeout: 10,
        WorkingDir: "/sandbox",
        HostConfig: {
            Memory: 1024 * 1024 * 100,
            DiskQuota: 1024 * 1024 * 100,
            OomKillDisable: false,
        }
    });

    await container.fs.put('./main.tar', {
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
        return promisifyStream(stream);
    };

    console.log(await exec(["g++", "main.cpp"], true));
    console.log(await exec(["./a.out"]));

    await container.stop();
    await container.delete();
})();