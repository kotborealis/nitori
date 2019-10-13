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
    },
    sandbox: {
        std_version: "c++11",
        working_dir: "/sandbox/"
    },
    testing: {
        libs: "/opt/testing_libs",
        hijack_main: "__HIJACK_MAIN__",
        test_src_name: "__nitori_test.cpp",
        test_obj_name: "__nitori_test.o"
    },
    cache: {
        dir: "./.cache/"
    }
};