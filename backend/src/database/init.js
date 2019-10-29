const debug = require('debug')('nitori:database:init');
const Nano = require('nano');

const databases = require('./db');
const db_views = require('./db_views');

module.exports = async ({database}) => {
    debug("Initializing couchdb");

    const nano = Nano(database);

    debug("Creating databases");

    for await (let database of databases) {
        debug("Creating db", database);

        try{
            await nano.db.create(database);
            debug("Created db", database);
        }
        catch(err){
            const {statusCode} = err;
            if(statusCode === 412) {
                debug("Database already exists, continuing");
            }
            else{
                debug("Error while creating db", err);
            }
        }
    }

    debug("Creating/updating views");

    for (let database in db_views) {
        debug("Creating views for db", database);

        const db = nano.use(database);
        const views = db_views[database];
        for await (let view of views) {
            try{
                const {etag} = await db.head(view._id);
                debug("Update view");
                await db.insert({
                    ...view,
                    _rev: JSON.parse(etag)
                }, view._id);
            }
            catch(e){
                await db.insert(view, view._id);
            }
        }
    }
};