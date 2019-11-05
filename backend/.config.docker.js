module.exports = {
    ...require('./.config.js'),
    docker: {
        socketPath: '/var/run/docker.sock'
    },
    database: {
        url: 'http://admin:123qwe@database:5984',
        name: 'nitori'
    }
};
