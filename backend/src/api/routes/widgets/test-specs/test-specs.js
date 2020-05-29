const {Router} = require('express');
const {TestSpecModel} = require('../../../../database');
const {compileTestSpec} = require('../../../../TestSpec/compileTestSpec');
const debug = require('debug')('nitori:api:widget:test-spec');

module.exports = (config) => {

    const router = Router();

    router.route('/')
        .get(async (req, res) => {
            const {
                limit,
                skip,
                name = ".*",
                sortBy,
                orderBy
            } = req.query;

            const {widgetId} = req;

            const testSpecs = await TestSpecModel
                .find({
                    name,
                    removed: false,
                    widget: widgetId,
                }, null, {limit, skip, lean: true})
                .sort({
                    [sortBy]: orderBy
                });

            delete testSpecs.specFile;
            delete testSpecs.exampleTargetFile;

            res.mongo(testSpecs);
        })
        .post(async (req, res) => {
                req.auth([({isAdmin}) => isAdmin === true]);

                const {widgetId} = req;
                const {name, description} = req.query;
                const {spec, example} = req.body;

                const specFile = {
                    name: 'spec.cpp',
                    content: spec,
                    type: 'text/cpp'
                };

                const {compilerResult, cache} = await compileTestSpec(config, [specFile]);

                debug("Cache key is", cache);

                if(compilerResult.exitCode !== 0)
                    return res.json({compilerResult});

                const testSpec = new TestSpecModel({
                    name,
                    widget: widgetId,
                    description,
                    cache,
                    specFile,
                    exampleTargetFile: {
                        name: 'example.cpp',
                        content: example,
                        type: 'text/cpp'
                    }
                });

                await testSpec.save();

                res.mongo({compilerResult, testSpec});
            }
        );

    router.route('/total-count')
        .get(async (req, res) =>
            res.mongo(await TestSpecModel.countDocuments({widget: req.widgetId}))
        );

    router.route('/:testSpecId')
        .get(
            async function(req, res) {
                req.auth([({isAdmin}) => isAdmin === true]);

                const {testSpecId} = req.params;
                const testSpec = await TestSpecModel.findById(testSpecId);

                if(!testSpec){
                    const err = new Error("Not found");
                    err.status = 404;
                    throw err;
                }

                res.mongo(testSpec);
            })
        .put(async (req, res) => {
                req.auth([({isAdmin}) => isAdmin === true]);

                const {testSpecId} = req.params;
                const {widgetId} = req;
                const {name, description} = req.query;
                const {spec, example} = req.body;

                const specSources = [{
                    name: 'spec.cpp',
                    content: spec,
                    type: 'text/cpp'
                }];

                const {compilerResult, cache} = await compileTestSpec(config, specSources);

                debug("Cache key is", cache);

                if(compilerResult.exitCode !== 0)
                    return res.json({compilerResult});

                const testSpec = await TestSpecModel.findByIdAndUpdate(testSpecId, {
                    name,
                    widget: widgetId,
                    description,
                    cache,
                    sourceFiles: specSources,
                    exampleTargetFile: {
                        name: 'example.cpp',
                        content: example,
                        type: 'text/cpp'
                    }
                }, {new: true, upsert: true});

                res.mongo({compilerResult, testSpec});
            }
        )
        .delete(
            async (req, res) => {
                req.auth([({isAdmin}) => isAdmin === true]);

                const {testSpecId} = req.params;

                await TestSpecModel.findByIdAndUpdate(testSpecId, {removed: true});

                res.json(testSpecId);
            }
        );

    return router;
};