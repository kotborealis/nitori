const debug = require('debug')('nitori:api:widgets:testTargets');
const {Router} = require('express');
const Database = require('../../../../database');
const {filesMiddleware} = require('../../../middleware/files');
const shortid = require('shortid');
const compileTestTarget = require('../../../../TestTarget/compileTestTarget');

module.exports = (config) => {
    const router = Router();
    const auth = require('../../../../auth').auth(config.auth.url);
    const db = new Database(require('nano')(config.database), config.database.name);

    const plainedDoc = async (doc) => ({
        ...doc,
        testSpec: await db.get(doc.testSpecId)
    });

    router.route('/')
        .get(async function(req, res) {
            req.auth([({isAdmin}) => isAdmin === true]);

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

            console.log(userDataName);

            const selector = {
                type: "TestTarget",
                widgetId,
                testSpecId: testSpecId ? {"$eq": testSpecId} : undefined,
                timestamp: (timestampStart || timestampEnd) ? {
                    "$gte": timestampStart ? timestampStart : undefined,
                    "$lte": timestampEnd ? timestampEnd : undefined,
                } : undefined,
                userData: {
                    id: userDataId ? {"$eq": userDataId} : undefined,
                    login: userDataLogin ? {"$eq": userDataLogin} : undefined,
                    name: userDataName ? {"$regex": userDataName} : undefined,
                    groupId: userDataGroupId ? {"$eq": userDataGroupId} : undefined,
                    groupName: userDataGroupName ? {"$eq": userDataGroupName} : undefined,
                }
            };

            if(Object.keys(selector.userData)
                .map(key => selector.userData[key])
                .every(value => value === undefined)
            )
                delete selector.userData;

            const sort = [
                ...[(req.query.sortBy && {[req.query.sortBy]: req.query.orderBy})]
            ].filter(id => id);

            const {docs} = await db.find({
                limit,
                skip,
                selector,
                sort
            });

            for await (let doc of docs){
                await plainedDoc(doc);
            }

            res.json(await Promise.all(docs.map(plainedDoc)));
        })
        .post(filesMiddleware(config.api.limits, 1, 10),
            async (req, res) => {
                const userData = await auth(req.cookies.PHPSESSID);

                const {widgetId} = req;
                const {testSpecId} = req.query;
                const id = shortid.generate();
                const {cache} = await db.get(testSpecId);

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

    router.route('/total-count')
        .get(async (req, res) => {
            const {widgetId} = req;

            const {rows: [{value}]} = await db.view("TestTarget", "totalCount", {key: widgetId});

            res.json(value);
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