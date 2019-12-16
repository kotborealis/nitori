const {Router} = require('express');
const Database = require('../../../database');
const shortid = require('shortid');

module.exports = (config) => {
    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.param('widgetId', async (req, res, next, value) => {
        const {rows: {length}} = await db.view("Widget", "list", {
            include_docs: true,
            key: value
        });

        if(length === 0){
            const err = new Error("Specified Widget was not found");
            err.status = 404;
            throw err;
        }

        req.widgetId = value;
        next();
    });

    router.get('/', async (req, res) => {
        req.auth([({isAdmin}) => isAdmin === true]);

        const {rows} = await db.view("Widget", "list", {
            include_docs: true
        });

        res.json(rows.map(({doc}) => doc));
    });

    router.post('/', async (req, res) => {
        req.auth([({isAdmin}) => isAdmin === true]);

        const {name} = req.query;
        const _id = shortid.generate();

        await db.insert({
            type: "Widget",
            name
        }, _id);

        res.status(201).json({name, _id});
    });

    router.get('/:widgetId/', async (req, res) => {
        const {rows} = await db.view("Widget", "list", {
            include_docs: true,
            key: req.widgetId
        });

        res.json(rows[0].doc);
    });

    router.use('/:widgetId/test-specs', require('./test-specs/test-specs')(config));
    router.use('/:widgetId/test-targets', require('./test-targets/test-targets')(config));

    return router;
};