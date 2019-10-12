class Objcopy {
    sandbox;

    /**
     *
     * @param {Sandbox} sandbox
     */
    constructor(sandbox){
        this.sandbox = sandbox;
    }

    redefine_sym = async (obj, old_sym, new_sym) => {
        if(Array.isArray(obj)){
            const result = [];

            for await (let file of obj) {
                const res = await this.sandbox.exec([
                    "objcopy",
                    file,
                    "--redefine-sym",
                    `${old_sym}=${new_sym}`
                ]);

                result.push(res);
            }

            return {exec: result};
        }
        else{
            return await this.redefine_sym([obj], old_sym, new_sym);
        }
    }
}

module.exports = {Objcopy};