const tar = require('tar-stream');

class Compiler {
    sandbox;
    compiler;
    timeout;

    /**
     *
     * @param {Sandbox} sandbox
     * @param timeout
     * @param compiler
     */
    constructor(sandbox, timeout = 60000, compiler = "g++") {
        this.sandbox = sandbox;
        this.compiler = compiler;
        this.timeout = timeout;
    }

    /**
     *
     * @param source_files Array of {name, content} pairs with source files
     * @param working_dir
     * @param std Which standart to use
     * @param I Include path
     * @returns {Promise<void>}
     */
    async compile_obj(source_files, {
        working_dir = "/sandbox/",
        std = "c++11",
        I = "/opt/nitori/",
    } = {}) {
        const {sandbox} = this;

        const cpp_file_names = source_files
            .map(({name}) => name)
            .filter((name) => name.endsWith(".cpp") || name.endsWith(".c"));

        const obj_file_names = cpp_file_names
            .map((name) => name.slice(0, name.lastIndexOf(".")) + ".o");

        const tarball = tar.pack();
        source_files.forEach(({name, content}) => {
            tarball.entry({name: `${working_dir}/${name}`}, content);
        });
        tarball.finalize();

        await sandbox.fs_put(tarball);

        const res = await sandbox.exec([
            this.compiler,
            ...(std ? [`--std=${std}`] : []),
            ...(I ? [`-I${I}`] : []),
            "-c",
            ...(cpp_file_names.length === 1 ? ["-o", obj_file_names[0]] : []),
            ...cpp_file_names
        ], {working_dir, timeout: this.timeout});

        return {
            exec: res,
            obj: obj_file_names
        };
    };

    /**
     *
     * @param object_file_names
     * @param working_dir
     * @param output Executable name
     * @param L Library path
     * @returns {Promise<{name: string, exec: *}>}
     */
    async compile_exe_from_obj(object_file_names, {
        working_dir = "/sandbox/",
        output = "a.out",
        L = ".",
    } = {}) {
        const {sandbox} = this;

        const res = await sandbox.exec([
            this.compiler,
            ...(L ? [`-L${L}`] : []),
            "-o", output,
            ...object_file_names
        ], {working_dir});

        return {
            exec: res,
            output
        };
    }
}

module.exports = Compiler;