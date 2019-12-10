const {Router} = require('express');
const filesMiddleware = require('../../../middleware/filesMiddleware');
const shortid = require('shortid');
const Database = require('../../../../database');
const {compileTestSpec} = require('../../../../TestSpec/compileTestSpec');

module.exports = (config) => {

    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.route('/')
        .get(async (req, res) => {
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

            const sort = [
                ...[(req.query.sortBy && {[req.query.sortBy]: req.query.orderBy})]
            ].filter(id => id);

            const {docs} = await db.find({
                limit,
                skip,
                selector,
                sort
            });

            res.json(docs);
        })
        .post(//authHandler([({isAdmin}) => isAdmin === true]),
            filesMiddleware(config.api.limits, 1, 10),
            async (req, res) => {
                const files = req.files;
                const {widgetId} = req;
                const {name, description} = req.query;

                const id = shortid.generate();

                await db.multipart.insert({
                        type: "TestSpec",
                        name,
                        widgetId,
                        description,
                        timestamp: Date.now(),
                    },
                    files.map(({name, content: data, content_type}) => ({name, data, content_type})),
                    id
                );

                const compilerResult = await compileTestSpec(config, files);
                res.json(compilerResult);
            }
        );

    router.route('/:testSpecId')
        .get(//authHandler([({isAdmin}) => isAdmin === true]),
            async function(req, res) {
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
            })
        .put(//authHandler([({isAdmin}) => isAdmin === true]),
            filesMiddleware(config.api.limits, 0, 10),
            async (req, res) => {
                const files = req.files;
                const id = req.testSpecId;
                const {name, description} = req.query;

                const testSpec = await db.get(id);

                if(name)
                    testSpec.name = name;
                if(description)
                    testSpec.description = description;

                testSpec.timestamp = Date.now();

                if(files.length){
                    const attachments = files.map(({name, content: data, content_type}) => ({
                        name,
                        data,
                        content_type
                    }));
                    await db.multipart.update(testSpec, attachments, id, testSpec._rev);

                    const compilerResult = await compileTestSpec(config, files);
                    res.json(compilerResult);
                }
                else{
                    await db.update(testSpec, id, testSpec._rev);
                    res.json({
                        compilerResult: {exitCode: 0, stdout: "Loaded from cache", stderr: ""}
                    });
                }
            }
        )
        .delete(//authHandler([({isAdmin}) => isAdmin === true]),
            async (req, res) => {
                await db.remove(req.testSpecId);
                res.json(true);
            }
        );

    return router;
};