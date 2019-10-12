module.exports = {
    docker: {
        host: "localhost",
        port: 2375
    },
    container: {
        Image: "nitori-sandbox",
        Tty: true,
        StopTimeout: 600,
        WorkingDir: "/sandbox",
        NetworkDisabled: true,
        HostConfig: {
            Memory: 1024 * 1024 * 1000,
            DiskQuota: 1024 * 1024 * 100,
            OomKillDisable: false,
        }
    }
};