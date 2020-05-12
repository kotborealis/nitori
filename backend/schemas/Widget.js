const {Schema} = require('mongoose');

const WidgetSchema = Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports.WidgetSchema = WidgetSchema;