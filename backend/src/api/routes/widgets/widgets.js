const {Router} = require('express');
const shortid = require('shortid');
const {WidgetModel} = require('../../../database');

module.exports = (config) => {
    const router = Router();

    router.param('widgetId', async (req, res, next, value) => {
        if(!await WidgetModel.findById({_id: value})){
            const err = new Error("Specified Widget was not found");
            err.status = 404;
            throw err;
        }

        req.widgetId = value;
        next();
    });

    router.get('/', async (req, res) => {
        const widgets = await WidgetModel.find();
        res.mongo(widgets);
    });

    router.post('/', async (req, res) => {
        req.auth([({isAdmin}) => isAdmin === true]);

        const {name} = req.query;

        const widget = new WidgetModel({name});
        await widget.save();

        res.status(201).mongo(widget);
    });

    router.get('/:widgetId/', async (req, res) => {
        req.auth([({isAdmin}) => isAdmin === true]);

        const {widgetId} = req;

        const widget = await WidgetModel.findById(widgetId);

        res.mongo(widget);
    });

    router.use('/:widgetId/test-specs', require('./test-specs/test-specs')(config));
    router.use('/:widgetId/test-targets', require('./test-targets/test-targets')(config));

    return router;
};