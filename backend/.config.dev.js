module.exports = {
    ...require('./.config.js'),
    api: {
        port: 3001,
        limits: {
            fileSize: 1024 * 10
        }
    },
    docker: undefined,
    database: {
        url: 'http://admin:123qwe@192.168.99.100:5984',
        name: 'nitori'
    }
};