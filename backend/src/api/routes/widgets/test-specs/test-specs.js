const {Router} = require('express');
const filesMiddleware = require('../../../middleware/filesMiddleware');
const shortid = require('shortid');
const Database = require('../../../../database');
const {precompile} = require('../../../../TestSpec/precompile');

module.exports = (config) => {

    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.route('/')
        .get(async (req, res) => {
            const {includeSources = false} = req.query;

            const {
                limit,
                skip,
                name
            } = req.query;

            const {widgetId} = req;

            const selector = {
                type: "TestSpec",
                name,
                widgetId
            };

            const {docs} = await db.find({
                limit,
                skip,
                selector
            });

            if(includeSources)
                await Promise.all(docs.map(async doc => doc.sourceFiles = await db.getAllAttachments(doc._id)));

            res.json(docs);
        })
        .post(//authHandler([({isAdmin}) => isAdmin === true]),
            filesMiddleware(config.api.limits, 1, 1),
            async function(req, res) {
                const [file] = req.files;
                const {widgetId} = req;
                const {name, description = ""} = req.body;

                const {docs: [test]} = await db.find({
                    selector: {
                        widgetId,
                        name,
                        type: "TestSpec"
                    }
                });

                let id = test ? test._id : shortid.generate();

                await db.multipart.update({
                    type: "TestSpec",
                    name,
                    widgetId,
                    description,
                    timestamp: Date.now(),
                }, [{
                    name: file.name,
                    data: file.content,
                    content_type: file.content_type
                }], id);

                const compilerResult = await precompile(config, id);

                res.json(compilerResult);
            });

    router.route('/:testSpecId')
        .get(async function(req, res) {
            const {testSpecId: _id} = req.params;
            const {includeSources = false} = req.query;

            const {docs: [doc]} = await db.find({
                selector: {
                    _id,
                    type: "TestSpec"
                }
            });

            if(!doc){
                const err = new Error("Not found");
                err.status = 404;
                throw err;
            }

            if(includeSources)
                doc.sourceFiles = await db.getAllAttachments(_id);


            res.json(doc);
        });

    return router;
};