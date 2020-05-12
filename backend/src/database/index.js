const {WidgetSchema} = require('../../schemas/Widget');
const {TestTargetSchema} = require('../../schemas/TestTarget');
const {TestSpecSchema} = require('../../schemas/TestSpec');
const {SourceFileSchema} = require('../../schemas/SourceFile');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const urlFromConfig = (config) => `mongodb://${config.database.url}/${config.database.name}`;

module.exports = {
    init: (config) => {
        mongoose.connect(urlFromConfig(config), {useNewUrlParser: true});
        return mongoose.connection;
    },
    SourceFileModel: mongoose.connection.model('SourceFile', SourceFileSchema),
    TestSpecModel: mongoose.connection.model('TestSpec', TestSpecSchema),
    TestTargetModel: mongoose.connection.model('TestTarget', TestTargetSchema),
    WidgetModel: mongoose.connection.model('Widget', WidgetSchema),
};