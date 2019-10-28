const {prototype: {demuxStream}} = require('docker-modem/lib/modem');

/**
 * Promisifies stream into strings
 * @param stream
 * @returns {Promise}
 */
const promisifyDockerStream = (stream) => new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    stream.on('end', () => resolve({stdout, stderr}));
    stream.on('error', reject);

    demuxStream(stream, {
        write: chunk => stdout += chunk.toString()
    }, {
        write: chunk => stderr += chunk.toString()
    });
});

module.exports = {promisifyDockerStream};