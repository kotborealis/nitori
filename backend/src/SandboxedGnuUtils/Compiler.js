const tar = require('tar-stream');
const debug = require('debug')('nitori:SandboxedGnuUtils:compiler');

class Compiler {
    sandbox;
    compiler_name;
    timeout;

    /**
     *
     * @param {Sandbox} sandbox
     * @param timeout
     * @param compiler_name
     */
    constructor(sandbox, timeout = 60000, compiler_name = "g++") {
        this.sandbox = sandbox;
        this.compiler_name = compiler_name;
        this.timeout = timeout;
    }

    /**
     *
     * @param source_files Array of {name, content} pairs with source files
     * @param working_dir
     * @param std Which standart to use
     * @param I Include path
     * @param include
     * @returns {Promise<{obj: *, exec: *}>}
     */
    async compile(source_files, {
        working_dir = "/sandbox/",
        std = "c++2a",
        I = [],
        include = [],
    } = {}) {
        const {sandbox} = this;

        const cpp_file_names = source_files
            .map(({name}) => name)
            .filter((name) => name.endsWith(".cpp") || name.endsWith(".c"));

        const obj_file_names = cpp_file_names
            .map((name) => name.slice(0, name.lastIndexOf(".")) + ".o");

        debug("creating tarball");

        const tarball = tar.pack();
        source_files
            .map(({name}) => name)
            .map(name => require('path').dirname(name))
            .filter((e, i, s) => s.indexOf(e) === i)
            .forEach(dir => tarball.entry({
                name: `${working_dir}/${dir}`,
                type: 'directory',
                mode: 0o777
            }));
        source_files
            .forEach(({name, content}) => tarball.entry({
                name: `${working_dir}/${name}`,
                type: 'file',
                mode: 0o644
            }, content));
        tarball.finalize();

        debug("created tarball");

        await sandbox.fs_put(tarball);

        debug("uploaded tarball");

        const res = await sandbox.exec([
            this.compiler_name,
            ...(std ? [`--std=${std}`] : []),
            ...I.map(_ => `-I${_}`),
            ...include.map(_ => [`-include`, _]).flat(),
            "-c",
            "-Winvalid-pch",
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
    async link(object_file_names, {
        working_dir = "/sandbox/",
        output = "a.out",
        L = ".",
    } = {}) {
        const {sandbox} = this;

        const res = await sandbox.exec([
            this.compiler_name,
            ...(L ? [`-L${L}`] : []),
            "-Winvalid-pch",
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