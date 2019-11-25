const debug = require('debug')('nitori:database');

module.exports = class {
    nano;
    db;

    constructor(nano, db){
        this.nano = nano;
        this.db = this.nano.use(db);
    }

    insert = (...args) => this.db.insert(...args);
    get = (...args) => this.db.get(...args);
    multipart = {
        insert: (...args) => this.db.multipart.insert(...args),
        update: async (data, files, doc) => {
            try{
                const {_rev} = await this.db.get(doc);
                return await this.db.multipart.insert({...data, _rev}, files, doc);
            }
            catch(e){
                return await this.db.multipart.insert(data, files, doc);
            }
        },
    };

    find = (...args) => this.db.find(...args);

    async exists(id) {
        try{
            await this.db.head(id);
            return true;
        }
        catch(e){
            return false;
        }
    }

    async getFirstAttachment(docname) {
        const {_attachments} = await this.db.get(docname);
        const filename = Object.keys(_attachments)[0];
        return this.db.attachment.get(docname, filename);
    }

    async getAllAttachments(docname) {
        const {_attachments} = await this.db.get(docname);
        const filenames = Object.keys(_attachments);
        const res = [];
        for await (let name of filenames) {
            res.push({
                name,
                data: await this.db.attachment.get(docname, name)
            });
        }
        return res;
    }

    async update(id, data) {
        try{
            const {_rev} = await this.db.get(id);
            return await this.db.insert({...data, _rev}, id);
        }
        catch(e){
            debug(e);
            return await this.db.insert(data, id);
        }
    }
};