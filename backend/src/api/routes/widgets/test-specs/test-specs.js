const {Router} = require('express');
const {TestSpecModel} = require('../../../../database');
const shortid = require('shortid');

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
                    name: {$regex: name, $options: 'i'},
                    removed: false,
                    widget: widgetId,
                }, null, {limit, skip, lean: true})
                .sort({
                    [sortBy]: orderBy
                });

            res.mongo(testSpecs.map(testSpec => {
                delete testSpec.specFile;
                delete testSpec.exampleTargetFile;
                return testSpec;
            }));
        })
        .post(async (req, res) => {
                req.auth([({isAdmin}) => isAdmin === true]);

                const {widgetId} = req;
                const {spec, example, name, description} = req.body;

                const specFile = {
                    name: `spec.${shortid.generate()}.cpp`,
                    content: spec,
                    type: 'text/cpp'
                };

                const testSpec = new TestSpecModel({
                    name,
                    widget: widgetId,
                    description,
                    specFile,
                    exampleTargetFile: {
                        name: 'example.cpp',
                        content: example,
                        type: 'text/cpp'
                    }
                });

                await testSpec.save();

                res.mongo(testSpec);
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
                const {spec, example, name, description} = req.body;

                const specFile = {
                    name: 'spec.cpp',
                    content: spec,
                    type: 'text/cpp'
                };

                const testSpec = await TestSpecModel.findByIdAndUpdate(testSpecId, {
                    name,
                    widget: widgetId,
                    description,
                    specFile,
                    exampleTargetFile: {
                        name: 'example.cpp',
                        content: example,
                        type: 'text/cpp'
                    }
                }, {new: true, upsert: true});

            res.mongo(testSpec);
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