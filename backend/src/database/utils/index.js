module.exports = {
    getFirstAttachment: async (db, docname) => {
        const {_attachments} = await db.get(docname);
        const filename = Object.keys(_attachments)[0];
        return db.attachment.get(docname, filename);
    }
};