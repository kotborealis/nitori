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
    view = (...args) => this.db.view(...args);

    multipart = {
        insert: (...args) => this.db.multipart.insert(...args),
        update: async (data, files, doc) => {
            try{
                const {_rev} = await this.db.get(doc);
                return this.db.multipart.insert({...data, _rev}, files, doc);
            }
            catch(e){
                return this.db.multipart.insert(data, files, doc);
            }
        },
    }

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
            return this.db.insert({...data, _rev}, id);
        }
        catch(e){
            debug(e);
            return this.db.insert(data, id);
        }
    }
};