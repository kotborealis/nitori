const {Router} = require('express');
const {TestTargetModel} = require('../../../../database/index');
const compileTestTarget = require('../../../../TestTarget/compileTestTarget');
const {archiveTestTargets} = require('../../../../TestTarget/archive');
const {TestSpecModel} = require('../../../../database');

module.exports = (config) => {
    const router = Router();

    router.route('/')
        .get(async function(req, res) {
            req.auth([({isAdmin}) => isAdmin === true]);

            const {
                limit,
                skip,
                testSpecId = "",
                userDataId = "",
                userDataLogin = ".*",
                userDataName = ".*",
                userDataGroupId = "",
                userDataGroupName = ".*",
                sortBy,
                orderBy
            } = req.query;

            const {widgetId} = req;

            const query = {
                widget: widgetId,
                'userData.login': {$regex: userDataLogin, $options: 'i'},
                'userData.name': {$regex: userDataName, $options: 'i'},
                'userData.groupName': {$regex: userDataGroupName, $options: 'i'}
            };

            const testTargets = await TestTargetModel
                .find(query, null, {limit, skip, lean: true})
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

                const testSpec = await TestSpecModel.findById(testSpecId);

                const sourceFiles = req.body;

                const testTarget = new TestTargetModel({
                    widget: widgetId,
                    userData,
                    testSpec: testSpecId,
                    sourceFiles
                });

                await testTarget.save();

                const {sandbox, worker} = compileTestTarget(config, testSpec, testTarget);

                res.setHeader("Sandbox-Id", sandbox.id);
                res.write(' ');
                res.write(JSON.stringify(await worker));
                res.end();

                await sandbox.stop();

                const {
                    targetCompilerResult,
                    specCompilerResult,
                    linkerResult,
                    runnerResult
                } = await worker;

                testTarget.targetCompilerResult = targetCompilerResult;
                testTarget.specCompilerResult = specCompilerResult;
                testTarget.linkerResult = linkerResult;
                testTarget.runnerResult = runnerResult;

                await testTarget.save();

                res.mongo(testTarget);
            });

    router.route('/total-count')
        .get(async (req, res) =>
            res.json(await TestTargetModel.countDocuments({widget: req.widgetId}))
        );

    router.route('/download')
        .get(async (req, res) => {
            res.setHeader('Content-disposition', 'attachment; filename=' + 'sources.tar');
            res.setHeader('Content-type', `application/x-tar`);

            (await archiveTestTargets(req.widgetId)).pipe(res);
        });

    router.route('/:testTargetId')
        .get(async (req, res) => {
            const {testTargetId} = req.params;
            const testTarget = await TestTargetModel.findById(testTargetId);

            if(!testTarget){
                const err = new Error("Not found");
                err.status = 404;
                throw err;
            }

            res.mongo(testTarget);
        });

    return router;
};