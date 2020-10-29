const aggregations = require('../../../../../schemas/aggregations');

const {Router} = require('express');
const {TestSpecModel, TestTargetModel} = require('../../../../database');
const {Types: {ObjectId}} = require('mongoose');

module.exports = (config) => {

    const router = Router();

    router.route('/test-targets/by/users/test-specs')
        .get(async (req, res) => {

            const widgetId = ObjectId(req.widgetId);
            const {includeSources = true} = req.query;

            const testTargets = await TestTargetModel
                .aggregate(aggregations.TestTargetsByUsersByTestSpecs({widgetId, includeSources}));

            res.mongo(testTargets);
        });

    router.route('/test-targets/by/groups/users/test-specs')
        .get(async (req, res) => {

            const widgetId = ObjectId(req.widgetId);
            const {includeSources = true} = req.query;

            const testTargets = await TestTargetModel
                .aggregate(aggregations.TestTargetsByGroupsByUsersByTestSpecs({widgetId, includeSources}));

            res.json(testTargets);
        });

    router.route('/test-targets/by/test-specs/users')
        .get(async (req, res) => {

            const widgetId = ObjectId(req.widgetId);
            const {includeSources = true} = req.query;

            const testTargets = await TestSpecModel
                .aggregate(aggregations.TestTargetsByTestSpecsByUsers({widgetId, includeSources}));

            res.mongo(testTargets);
        });

    router.route('/users')
        .get(async (req, res) => {
            const widgetId = ObjectId(req.widgetId);

            const testTargets = await TestTargetModel
                .aggregate(aggregations.Users({widgetId}));

            res.mongo(testTargets);
        });

    return router;
};