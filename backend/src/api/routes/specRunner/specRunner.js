const compileTestTarget = require('../../../TestTarget/compileTestTarget');
const {Router} = require('express');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const {spec, example} = req.body;

        res.status(200).json(await compileTestTarget(
            config,
            {
                specFile: {
                    name: "spec.cpp",
                    content: spec
                }
            },
            {
                sourceFiles: [{
                    name: "example.cpp",
                    content: example
                }]
            }
        ));
    });

    return router;
};