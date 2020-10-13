require('chen.js').env();

module.exports = {
    api: {
        port: process.env.API_PORT || 3000,
        limits: {
            fileSize: process.env.API_LIMITS_FILESIZE || (1024 * 10)
        }
    },
    docker: process.env.DOCKER ? JSON.parse(process.env.DOCKER) : {
        socketPath: '/var/run/docker.sock'
    },
    container: {
        Image: "nitori_sandbox",
        Tty: true,
        StopTimeout: 600,
        WorkingDir: "/sandbox",
        NetworkDisabled: true,
        HostConfig: {
            Memory: 1024 * 1024 * 1000,
            DiskQuota: 1024 * 1024 * 100,
            OomKillDisable: false,
        },
        imageContextPath: "../sandbox/"
    },
    sandbox: {
        container_prefix: "nitori-sandbox-",
        std_version: "c++2a",
        working_dir: "/sandbox/"
    },
    testing: {
        libs: "/opt/testing_libs",
        hijack_main: "__NITORI_HIJACK_MAIN__",
        test_archive_name: "__nitori_test.a"
    },
    timeout: {
        compilation: 1000 * 60,
        precompilation: 0,
        run: 1000 * 10
    },
    database: {
        url: process.env.DATABASE_URL || '127.0.0.1:27017',
        name: process.env.DATABASE_NAME || 'nitori'
    },
    auth: {
        url: process.env.AUTH_API || 'http://127.0.0.1:8080/auth/user_data.php',
        admins: (process.env.AUTH_ADMINS || 'prep')
            .split(',').filter(i => i),
    },
    logging: {
        transports:
            (process.env.LOGGING_TRANSPORTS || 'syslog,console')
                .split(',').filter(i => i),
        syslog: {
            host: process.env.LOGGING_SYSLOG_HOST || 'vector',
            port: process.env.LOGGING_SYSLOG_PORT || 513,
            protocol: 'udp4'
        }
    }
};