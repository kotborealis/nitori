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

    debug("Uploading model to db");

    await Promise.all(
        glob.sync('./src/database/models/*.js')
            .map(modelPath => path.basename(modelPath, '.js'))
            .map(name => ({
                ...require(`./models/${name}.js`),
                _id: `_design/${name}`
            }))
            .map(async (design) => {
                try{
                    const {etag} = await db.head(design._id);
                    return db.insert({
                        ...design,
                        _rev: JSON.parse(etag)
                    }, design._id);
                }
                catch(e){
                    return db.insert(design, design._id);
                }
            })
    );
};