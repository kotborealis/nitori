const {Router} = require('express');
const filesMiddleware = require('../middleware/filesMiddleware');
const shortid = require('shortid');
const Database = require('../../database');
const {precompile} = require('../../TestSpecPrecompile/precompile');

module.exports = (config) => {

    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.route('/')
        .get(async function(req, res) {
            const {id} = req.query;

            const {docs: [doc]} = await db.find({
                selector: {
                    _id: id,
                    type: "TestSpec"
                }
            });

            if(!doc){
                const err = new Error("Not found");
                err.status = 404;
                throw err;
            }

            res.json(doc);
        })
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
            });

    router.route('/list')
        .get(async (req, res) => {
            const {
                limit,
                skip,
                name,
                wid
            } = req.query;

            const selector = {
                type: "TestSpec",
                name,
                wid
            };

            const {docs} = await db.find({
                limit,
                skip,
                selector
            });

            res.json(docs);
        });

    return router;
};