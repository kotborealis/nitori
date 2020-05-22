const debug = require('debug')('nitori:api:widgets:testTargets');
const {Router} = require('express');
const {TestTargetModel} = require('../../../../database/index');
const compileTestTarget = require('../../../../TestTarget/compileTestTarget');
const {TestSpecModel} = require('../../../../database');

module.exports = (config) => {
    const router = Router();

    router.route('/')
        .get(async function(req, res) {
            req.auth([({isAdmin}) => isAdmin === true]);

            const {
                limit,
                skip,
                testSpecId,
                userDataId,
                userDataLogin,
                userDataName,
                userDataGroupId,
                userDataGroupName,
                sortBy,
                orderBy
            } = req.query;

            const {widgetId} = req;

            const testTargets = await TestTargetModel
                .find({
                    _id: testSpecId,
                    widget: widgetId,
                    userData: {
                        userId: userDataId,
                        login: userDataLogin,
                        name: userDataName,
                        groupId: userDataGroupId,
                        userDataGroupName: userDataGroupName
                    }
                }, null, {limit, skip, lean: true})
                .sort({
                    [sortBy]: orderBy
                });

            res.mongo(testTargets);
        })
        .post(
            async (req, res) => {
                req.auth();

                const {userData} = req;
                const {widgetId} = req;
                const {testSpecId} = req.query;

                const {cache} = await TestSpecModel.findById(testSpecId);

                const sourceFiles = req.body;

                const testTarget = new TestTargetModel({
                    widget: widgetId,
                    userData,
                    testSpec: testSpecId,
                    sourceFiles,
                    ...await compileTestTarget(config, cache, sourceFiles)
                });

                await testTarget.save();

                res.mongo(testTarget);
            });

    router.route('/total-count')
        .get(async (req, res) =>
            res.json(await TestTargetModel.countDocuments({widget: req.widgetId}))
        );

    router.route('/:testTargetId')
        .get(async (req, res) => {
            const {testTargetId} = req.params;
            const testTarget = await TestSpecModel.findById(testTargetId);

            if(!testTarget){
                const err = new Error("Not found");
                err.status = 404;
                throw err;
            }

            res.mongo(testTarget);
        });

    return router;
};