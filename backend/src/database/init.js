const debug = require('debug')('nitori:database:init');
const path = require('path');
const Nano = require('nano');
const glob = require('glob');

module.exports = async ({database}) => {
    debug("Initializing couchdb");

    const nano = Nano(database);

    debug("Creating database");

    try{
        await nano.db.create(database.name);
        debug("Created db", database.name);
    }
    catch(err){
        const {statusCode} = err;
        if(statusCode === 412){
            debug("Database already exists, continuing");
        }
        else{
            debug("Error while creating db", err);
        }
    }

    const db = nano.db.use(database.name);

    debug("Creating designs and views");

    const designPaths = glob.sync('./src/database/designs/*');

    for(let designPath of designPaths){
        const designName = path.basename(designPath, '');

        debug("Processing design", designName);

        const views = {};

        const viewPaths = glob.sync(`./src/database/designs/${designName}/*.js`);

        for(let viewPath of viewPaths){
            const view = path.basename(viewPath, '.js');
            debug("Processing view", view);
            views[view] = require(`./designs/${designName}/${view}.js`);
        }

        const design = {
            _id: `_design/${designName}`,
            views
        };

        try{
            const {etag} = await db.head(design._id);
            await db.insert({
                ...design,
                _rev: JSON.parse(etag)
            }, design._id);
        }
        catch(e){
            await db.insert(design, design._id);
        }
    }
};