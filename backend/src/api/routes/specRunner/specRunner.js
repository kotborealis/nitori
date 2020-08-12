const {compileSpecRunner} = require('../../../SpecRunner/compileSpecRunner');
const {Router} = require('express');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        const {spec, example} = req.body;

        res.status(200).json(await compileSpecRunner(config, spec, example));
    });

    return router;
};