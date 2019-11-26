const {Router} = require('express');
const Database = require('../../../database');

module.exports = (config) => {
    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.param('widgetId', (req, res, next, value) => {
        req.widgetId = value;
        next();
    });

    router.get('/', async (req, res) => {
        const {docs} = await db.find({
            selector: {
                type: "TestSpec"
            },
            fields: ["widgetId"]
        });

        res.json(
            docs
                .map(doc => doc.wid)
                .filter((value, index, self) =>
                    self.indexOf(value) === index
                )
        );
    });

    router.get('/:widgetId/', async (req, res) => {
        res.json(req.widgetId);
    });

    router.use('/:widgetId/test-specs', require('./test-specs')(config));
    router.use('/:widgetId/test-targets', require('./test-targets')(config));

    return router;
};