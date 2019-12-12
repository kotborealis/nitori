const {Router} = require('express');
const filesMiddleware = require('../../../middleware/filesMiddleware');
const shortid = require('shortid');
const Database = require('../../../../database');
const {compileTestSpec} = require('../../../../TestSpec/compileTestSpec');
const debug = require('debug')('nitori:api:widget:test-spec');

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

                const {compilerResult, cache} = await compileTestSpec(config, files);

                debug("Cache key is", cache);

                if(compilerResult.exitCode === 0){
                    const id = shortid.generate();
                    await db.multipart.insert({
                            type: "TestSpec",
                            name,
                            widgetId,
                            description,
                            cache,
                            timestamp: Date.now(),
                        },
                        files.map(({name, content: data, content_type}) => ({name, data, content_type})),
                        id
                    );

                    res.json({
                        compilerResult,
                        testSpec: {
                            ...await db.get(id),
                            sourceFiles: await db.getAllAttachments(id)
                        }
                    });
                }
                else{
                    res.json({compilerResult});
                }
            }
        );

    router.route('/:testSpecId')
        .get(//authHandler([({isAdmin}) => isAdmin === true]),
            async function(req, res) {
                const {testSpecId: _id} = req.params;
                const {includeSources = false, rev = undefined} = req.query;

                const doc = await db.get(_id, rev ? {rev} : {});

                if(doc.type !== "TestSpec"){
                    const err = new Error("Not found");
                    err.status = 404;
                    throw err;
                }

                if(includeSources)
                    doc.sourceFiles = await db.getAllAttachments(_id, rev ? {rev} : {});

                res.json(doc);
            })
        .put(//authHandler([({isAdmin}) => isAdmin === true]),
            filesMiddleware(config.api.limits, 0, 10),
            async (req, res) => {
                const files = req.files;
                const testSpecId = req.testSpecId;
                const {name, description} = req.query;

                const testSpec = await db.get(testSpecId);

                if(testSpec.type !== "TestSpec"){
                    const err = new Error("Not found");
                    err.status = 404;
                    throw err;
                }

                if(name)
                    testSpec.name = name;
                if(description)
                    testSpec.description = description;

                testSpec.timestamp = Date.now();

                if(files.length){
                    const {compilerResult, cache} = await compileTestSpec(config, files);

                    if(compilerResult.exitCode === 0){
                        const attachments = files.map(({name, content: data, content_type}) => ({
                            name,
                            data,
                            content_type
                        }));
                        testSpec.cache = cache;
                        await db.multipart.update(testSpec, attachments, testSpecId, testSpec._rev);
                    }

                    res.json({
                        compilerResult,
                        testSpec: {
                            ...await db.get(testSpecId),
                            sourceFiles: await db.getAllAttachments(testSpecId)
                        }
                    });
                }
                else{
                    await db.update(testSpec, testSpecId, testSpec._rev);

                    res.json({
                        compilerResult,
                        testSpec: {
                            ...await db.get(testSpecId),
                            sourceFiles: await db.getAllAttachments(testSpecId)
                        }
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