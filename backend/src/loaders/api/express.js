require('express-async-errors');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {correlationMiddleware} = require('../../api/middleware/correlationMiddleware');

/**
 * Configure base middleware for express app
 * @param app
 * @param config
 */
module.exports = ({app, config}) => {

    // transform mongo objects into plain json
    // TODO: rewrite, dirty hacks
    app.use((req, res, next) => {
        res.mongo = obj => res.json(JSON.parse(JSON.stringify(obj)));
        next();
    });

    // Allow cross-origin requests
    app.use(cors());

    // Body parser middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // Cookie parser middleware
    app.use(cookieParser());

    // Correlation ID middleware
    app.use(correlationMiddleware());
};