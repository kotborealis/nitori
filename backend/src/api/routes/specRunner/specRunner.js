const {compileSpecRunner} = require('../../../SpecRunner/compileSpecRunner');
const {Router} = require('express');
const debug = require('debug')('nitori:api:specRunner');

module.exports = (config) => {
    const router = Router();

    router.post('/', async (req, res) => {
        //req.auth([({isAdmin}) => isAdmin === true]);

        const {spec, example} = req.body;

        res.status(200).json(await compileSpecRunner(config, spec, example));
    });

    return router;
};