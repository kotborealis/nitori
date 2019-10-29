const debug = require('debug')('nitori:database:utils');

module.exports = {
    exists: async (db, id) => {
        try {
            await db.head(id);
            return true;
        }
        catch(e) {
            return false;
        }
    },
    getFirstAttachment: async (db, docname) => {
        const {_attachments} = await db.get(docname);
        const filename = Object.keys(_attachments)[0];
        return db.attachment.get(docname, filename);
    },
    update: async (db, data, id) => {
        try{
            const {_rev} = await db.get(id);
            return db.insert({...data, _rev}, id);
        }
        catch(e){
            debug(e);
            return db.insert(data, id);
        }
    },
    multipartUpdate: async (db, data, files, id) => {
        try{
            const {_rev} = await db.get(id);
            return db.multipart.insert({...data, _rev}, files, id);
        }
        catch(e){
            return db.multipart.insert(data, files, id);
        }
    }
};