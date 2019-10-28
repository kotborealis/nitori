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
        dir: "./data/tests/",
        libs: "/opt/testing_libs",
        hijack_main: "__NITORI_HIJACK_MAIN__",
        test_src_name: "__nitori_test.cpp",
        test_obj_name: "__nitori_test.o"
    },
    cache: {
        dir: "./data/cache/"
    },
    timeout: {
        compilation: 1000 * 60,
        precompilation: 0,
        run: 1000 * 10
    }
};