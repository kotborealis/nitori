const debug = require('debug')('nitori:database:init');
const Nano = require('nano');

const databases = [
    'tasks'
];

module.exports = async ({database}) => {
    const nano = Nano(database);

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
};