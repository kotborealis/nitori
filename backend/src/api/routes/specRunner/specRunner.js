const compileTestTarget = require('../../../TestTarget/compileTestTarget');
const {compilationSet} = require('../../../TestTarget/compilationSet');
const {Router} = require('express');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const {spec, example} = req.body;

        const {sandbox, worker} = compileTestTarget(
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
        );

        res.setHeader("Sandbox-Id", sandbox.id);
        res.write(' ');
        res.write(JSON.stringify(await worker));
        res.end();
    });

    return router;
};