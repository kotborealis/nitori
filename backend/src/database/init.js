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

        const processEntries = (name) => {
            const entries = {};
            const entriesPaths = glob.sync(`./src/database/designs/${designName}/${name}/*.js`);

            for(let entryPath of entriesPaths){
                const entry = path.basename(entryPath, '.js');
                debug(`Processing entry from ${name}`, entry);
                entries[entry] = require(`./designs/${designName}/${name}/${entry}.js`);
            }

            return entries;
        }

        const design = {
            _id: `_design/${designName}`,
            views: processEntries('views'),
            shows: processEntries('shows'),
            lists: processEntries('lists'),
            updates: processEntries('updates'),
            filters: processEntries('filters'),
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