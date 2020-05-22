const mongoose = require('mongoose');
const {Schema} = mongoose;

const ExecOutputSchema = Schema({
    exitCode: {
        type: Number,
        required: false,
        default: 0
    },
    stderr: {
        type: String,
        required: false,
        default: ''
    },
    stdout: {
        type: String,
        required: false,
        default: ''
    },
});

module.exports.ExecOutputSchema = ExecOutputSchema;