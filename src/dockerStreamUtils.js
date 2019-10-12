/**
 * Promisifies multiplexed docker stream and parses it into separate stdin, stdout, stderr
 * @param stream
 * @returns {Promise<any>}
 */
const dockerStreamUtils = (stream) => new Promise((resolve, reject) => {
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

/**
 * Promisifies stream into string
 * @param stream
 * @returns {Promise<any>}
 */
const promisifyDockerStream = (stream) => new Promise((resolve, reject) => {
    let data = "";

    stream.on('data', chunk => data += chunk.toString());
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
});

module.exports = {promisifyDockerStream: dockerStreamUtils};