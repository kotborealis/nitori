const compileTestTarget = require('../../../TestTarget/compileTestTarget');
const {compilationSet} = require('../../../TestTarget/compilationSet');
const {Router} = require('express');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const {spec, example, debug = false} = req.body;

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
        if(debug){
            await sandbox.stdout(["# Starting debugging session"]);
            await sandbox.stdout(["# Session will be ended after this page is closed"]);
            await sandbox.exec(["/bin/bash"], {interactive: true});
        }
        await sandbox.stop();
        res.end();
    });

    return router;
};