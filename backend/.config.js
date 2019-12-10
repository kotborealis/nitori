module.exports = {
    api: {
        port: 3000,
        limits: {
            fileSize: 1024 * 10
        }
    },
    docker: {
        host: "localhost",
        port: 2375
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
        }
    },
    sandbox: {
        container_prefix: "nitori-sandbox-",
        std_version: "c++11",
        working_dir: "/sandbox/"
    },
    testing: {
        libs: "/opt/testing_libs",
        hijack_main: "__NITORI_HIJACK_MAIN__",
        test_archive_name: "__nitori_test.a"
    },
    cache: {
        dir: "./data/cache/"
    },
    timeout: {
        compilation: 1000 * 60,
        precompilation: 0,
        run: 1000 * 10
    },
    database: {
        url: 'http://admin:123qwe@localhost:5984',
        name: 'nitori'
    },
    auth: {
        url: 'http://127.0.0.1:8080/auth/user_data.php'
    }
};