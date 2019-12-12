const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api.yaml');

const swaggerUi = require('swagger-ui-express');
const {OpenApiValidator} = require('express-openapi-validator');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const shortid = require('shortid');
shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.");

const debug = require('debug')('nitori:api');
const express = require('express');
require('express-async-errors');

const Database = require('../database');

const {Sandbox} = require('../Sandbox');
const {Docker} = require('node-docker-api');

module.exports = (config) => {
    const authHandler = require('../auth').middleware(config.auth.url);
    const db = new Database(require('nano')(config.database), config.database.name);

    const port = config.api.port;

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(cookieParser());
    //app.use(authHandler());

    app.use('/swagger/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    new OpenApiValidator({
        apiSpec: './api.yaml',
        validateRequests: true,
        validateResponses: {
            removeAdditional: true
        },
        multerOpts: {
            limits: {
                fileSize: config.api.limits.fileSize
            }
        }
    }).install(app);

    app.use('/widgets/', require('./routes/widgets/widgets')(config));

    //noinspection JSUnusedLocalSymbols
    app.use(function(err, req, res, next) {
        debug("Error handler: ", err);

        res.status(err.status || 500).json({
            message: err.message || err.toString(),
            errors: err.errors || [err.message]
        });
    });

    const server = app.listen(port, () => debug(`Server running on 0.0.0.0:${port}`));

    process.on('SIGINT', async () => {
        server.close();
        try{
            const docker = new Docker(config.docker);
            await Sandbox.destroy_all(docker);
            process.exit(0);
        }
        catch(e){
            debug("Error on handling signal", e);
            process.exit(1);
        }
    });
};