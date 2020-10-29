const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const swaggerDocument = YAML.load('./api.yaml');

/**
 * Configure swagger ui and validator
 * @param app
 * @param config
 */
module.exports = ({app, config}) => {
    if(process.env.PROD_API){
        swaggerDocument.servers.unshift({
            url: process.env.PROD_API,
            description: 'Current production server'
        });
    }

    // swagger UI
    app.use('/swagger/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use(
        OpenApiValidator.middleware({
            apiSpec: './api.yaml',
            validateRequests: true,
            validateResponses: true,
            validateFormats: 'fast',
            validateSecurity: false,
            fileUploader: {
                limits: {
                    fileSize: config.api.limits.fileSize
                }
            }
        })
    );
};