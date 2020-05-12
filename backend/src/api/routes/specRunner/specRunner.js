const {compileSpecRunner} = require('../../../SpecRunner/compileSpecRunner');
const {Router} = require('express');
const debug = require('debug')('nitori:api:specRunner');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const {spec, example} = req.body;

        debug("specRunner", spec, example);

        res.status(200).json(await compileSpecRunner(config, spec, example));
    });

    return router;
};