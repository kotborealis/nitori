const mongoose = require('mongoose');
const {Schema} = mongoose;

const {SourceFileSchema} = require('./SourceFile');

const TestSpecSchema = Schema({
    name: {
        type: String,
        required: true
    },
    widget: {
        type: Schema.Types.ObjectID,
        ref: 'Widget',
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now
    },
    specFile: SourceFileSchema,
    exampleTargetFile: SourceFileSchema,
    cache: {
        type: String,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false,
    }
});

module.exports.TestSpecSchema = TestSpecSchema;