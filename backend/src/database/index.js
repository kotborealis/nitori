module.exports = class {
    nano;
    db;

    multipart = {
        /**
         *
         * @param doc
         * @param attachments
         * @param params
         * @returns {Promise<nano.DocumentInsertResponse>}
         */
        insert: (doc, attachments, params) => this.db.multipart.insert(doc, attachments, params),

        /**
         * Multipart equivalent of db.update
         * @param data
         * @param files
         * @param doc
         * @param rev
         * @returns {Promise<nano.DocumentInsertResponse>}
         */
        update: async (data, files, doc, rev = null) => {
            try{
                const {_rev} = rev === null ? await this.db.get(doc) : rev;
                return await this.db.multipart.insert({...data, _rev}, files, doc);
            }
            catch(e){
                return await this.db.multipart.insert(data, files, doc);
            }
        },
    };

    /**
     *
     * @param nano Nano instance
     * @param db Database name
     */
    constructor(nano, db) {
        this.nano = nano;
        this.db = this.nano.use(db);
    }

    /**
     *
     * @param doc
     * @param params
     * @returns {Promise<nano.DocumentInsertResponse>}
     */
    insert = (doc, params = {}) => this.db.insert(doc, params);

    /**
     *
     * @param docname
     * @param params
     * @returns {*}
     */
    get = (docname, params = {}) => this.db.get(docname, params);

    /**
     * Update document by id. If it does not exists, create it
     * @param data
     * @param docname
     * @param rev
     * @returns {Promise<nano.DocumentInsertResponse>}
     */
    update = async (data, docname, rev = null) => {
        try{
            const {_rev} = rev === null ? await this.db.get(docname) : rev;
            return await this.db.insert({...data, _rev}, docname);
        }
        catch(e){
            return await this.db.insert(data, docname);
        }
    };

    /**
     * Force remove document
     * @param docname
     * @param rev
     * @returns {Promise<*>}
     */
    remove = async (docname, rev = null) => {
        const {_rev} = rev === null ? await this.db.get(docname) : rev;
        return await this.db.destroy(docname, _rev);
    };


    /**
     *
     * @param selector
     * @returns {Promise<nano.MangoResponse<any>> | * | number | bigint}
     */
    find = (selector) => this.db.find(selector);

    /**
     *
     * @param designname
     * @param viewname
     * @param params
     * @returns {Promise<nano.DocumentViewResponse<any, any>> | *}
     */
    view = (designname, viewname, params = {}) => this.db.view(designname, viewname, params);

    /**
     * Check if specified doc exists
     *
     * Uses head internally
     * @param docname
     * @returns {Promise<boolean>}
     */
    async exists(docname) {
        try{
            await this.db.head(docname);
            return true;
        }
        catch(e){
            return false;
        }
    }

    /**
     * Get first attachemnt of specified doc as {name, data} object
     * @param docname
     * @returns {Promise<any>}
     */
    async getFirstAttachment(docname) {
        const {_attachments} = await this.db.get(docname);
        const filename = Object.keys(_attachments)[0];
        return this.db.attachment.get(docname, filename);
    }

    /**
     * Get all attachments of specified doc as array of {name, data} objects
     * @param docname
     * @returns {Promise<[]>}
     */
    async getAllAttachments(docname) {
        const {_attachments} = await this.db.get(docname);
        const filenames = Object.keys(_attachments);
        const res = [];
        for await (let name of filenames){
            res.push({
                name,
                data: await this.db.attachment.get(docname, name)
            });
        }
        return res;
    }
};