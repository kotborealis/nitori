const tar = require('tar-stream');

class Compiler {
    sandbox;
    compiler;

    /**
     *
     * @param {Sandbox} sandbox
     * @param compiler
     */
    constructor(sandbox, compiler = "g++"){
        this.sandbox = sandbox;
        this.compiler = compiler;
    }

    /**
     *
     * @param source_files Array of {name, content} pairs with source files
     * @param std Which standart to use
     * @param I Include path
     * @returns {Promise<void>}
     */
    compile_obj = async (source_files, {
        std = "c++11",
        I = "/opt/nitori/",
    } = {}) => {
        const {sandbox} = this;

        const cpp_file_names = source_files
            .map(({name}) => name)
            .filter((name) => name.endsWith(".cpp") || name.endsWith(".c"));

        const obj_file_names = cpp_file_names
            .map((name) => name.slice(0, name.lastIndexOf(".")) + ".o");

        const tarball = tar.pack();
        source_files.forEach(({name, content}) => {
            tarball.entry({name: `/sandbox/${name}`}, content);
        });
        tarball.finalize();

        await sandbox.fs_put_root(tarball);

        const res = await sandbox.exec([
            this.compiler,
            ...(std ? [`--std=${std}`] : []),
            ...(I ? [`-I${I}`] : []),
            "-c",
            ...(cpp_file_names.length === 1 ? ["-o", obj_file_names[0]] : []),
            ...cpp_file_names
        ]);

        return {
            exec: res,
            obj: obj_file_names
        };
    };

    /**
     *
     * @param object_file_names
     * @param output Executable name
     * @param L Library path
     * @returns {Promise<{name: string, exec: *}>}
     */
    compile_exe_from_obj = async (object_file_names, {
        output = "a.out",
        L = ".",
    } = {}) => {
        const {sandbox} = this;

        const res = await sandbox.exec([
            this.compiler,
            ...(L ? [`-L${L}`] : []),
            "-o", output,
            ...object_file_names
        ]);

        return {
            exec: res,
            output
        };
    }
}

module.exports = {Compiler};