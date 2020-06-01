const mongoose = require('mongoose');
const {Schema} = mongoose;

const SourceFileSchema = Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: false
    },
});

module.exports.SourceFileSchema = SourceFileSchema;
