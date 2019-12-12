const {Router} = require('express');
const Database = require('../../../../database');
const filesHandler = require('../../../middleware/filesMiddleware');
const shortid = require('shortid');
const md5 = require('md5');
const {Objcopy} = require('../../../../SandboxedGnuUtils');
const {Compiler} = require('../../../../SandboxedGnuUtils');
const {Sandbox} = require('../../../../Sandbox');
const {Docker} = require('node-docker-api');
const {ObjectCache} = require('../../../../ObjectCache');
const compileTestTarget = require('../../../../TestTarget/compileTestTarget');

module.exports = (config) => {
    const router = Router();
    const auth = require('../../../../auth').auth(config.auth.url);
    const db = new Database(require('nano')(config.database), config.database.name);

    const plainedDoc = async (doc) => ({
        ...doc,
        testSpec: await db.get(doc.testSpecId, {rev: doc.testSpecRev})
    });

    router.route('/')
        .get(async function(req, res) {
            const {widgetId} = req;

            const {
                limit,
                skip,
                testSpecId,
                timestampStart,
                timestampEnd,
                userDataId,
                userDataLogin,
                userDataName,
                userDataGroupId,
                userDataGroupName
            } = req.query;

            const selector = {
                type: "TestTarget",
                widgetId,
                testSpecId: testSpecId ? {"$eq": testSpecId} : undefined,
                timestamp: (timestampStart || timestampEnd) ? {
                    "$gte": timestampStart ? timestampStart : undefined,
                    "$lte": timestampEnd ? timestampEnd : undefined,
                } : undefined,
                userDataId: userDataId ? {"$eq": userDataId} : undefined,
                userDataLogin: userDataLogin ? {"$eq": userDataLogin} : undefined,
                userDataName: userDataName ? {"$eq": userDataName} : undefined,
                userDataGroupId: userDataGroupId ? {"$eq": userDataGroupId} : undefined,
                userDataGroupName: userDataGroupName ? {"$eq": userDataGroupName} : undefined,
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

            res.json(await Promise.all(docs.map(plainedDoc)));
        })
        .post(filesHandler(config.api.limits, 1, 10),
            async (req, res) => {
                const userData = await auth(req.cookies.PHPSESSID);

                const {widgetId} = req;
                const {testSpecId} = req.query;
                const id = shortid.generate();
                const {_rev: testSpecRev, cache} = await db.get(testSpecId);

                const testTargetRes = await compileTestTarget(config, cache, req.files);

                const sources = req.files.map(({name, content: data, content_type}) => ({
                    name, data, content_type
                }));

                await db.multipart.insert({
                    type: "TestTarget",
                    widgetId,
                    timestamp: Date.now(),
                    userData,
                    testSpecId,
                    testSpecRev,
                    ...{
                        compilerResult: {exitCode: undefined, stdout: ""},
                        linkerResult: {exitCode: undefined, stdout: ""},
                        runnerResult: {exitCode: undefined, stdout: ""},
                        ...testTargetRes
                    }
                }, sources, id);

                const data = await db.get(id);
                data.sourceFiles = sources.map(file => ({
                    ...file,
                    data: file.data.toString()
                }));
                res.json(await plainedDoc(data));
            });

    router.route('/:testTargetId')
        .get(async (req, res) => {
            const {testTargetId: _id} = req.params;
            const {widgetId} = req;

            const {docs: [test]} = await db.find({selector: {_id, type: "TestTarget", widgetId}});

            if(!test){
                const err = new Error("Specified TestTarget does not exists");
                err.status = 404;
                throw err;
            }

            test.sourceFiles = await db.getAllAttachments(_id);
            res.json(await plainedDoc(test));
        });

    return router;
};