const {Router} = require('express');
const filesMiddleware = require('../middleware/filesMiddleware');
const shortid = require('shortid');
const Database = require('../../database');
const {precompile} = require('../../TestSpecPrecompile/precompile');

module.exports = (config) => {

    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.route('/')
        .post(//authHandler([({isAdmin}) => isAdmin === true]),
            filesMiddleware(config.api.limits, 1, 1),
            async function(req, res) {
                const [file] = req.files;
                const {wid} = req.query;
                const {name, description = ""} = req.body;

                const {docs: [test]} = await db.find({
                    selector: {
                        wid,
                        name,
                        type: "TestSpec"
                    }
                });

                let id = test ? test._id : shortid.generate();

                await db.multipart.update({
                    type: "TestSpec",
                    name,
                    wid,
                    description
                }, [{
                    name: file.name,
                    data: file.content,
                    content_type: file.content_type
                }], id);

                const compilerResult = await precompile(config, id);

                res.json(compilerResult);
            })
        .get(async function(req, res) {
            const {wid} = req.query;

            const {docs} = await db.find({
                selector: {
                    wid,
                    type: "TestSpec"
                }
            });

            res.json(docs);
        });

    return router;
};