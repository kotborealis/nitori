module.exports = {
    ...require('./.config.js'),
    docker: {
        socketPath: '/var/run/docker.sock'
    }
};