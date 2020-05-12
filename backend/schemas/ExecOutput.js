const mongoose = require('mongoose');
const {Schema} = mongoose;

const ExecOutputSchema = Schema({
    exitCode: {
        type: Number,
        required: true
    },
    stderr: {
        type: String,
        required: true
    },
    stdout: {
        type: String,
        required: true
    },
});

module.exports.ExecOutputSchema = ExecOutputSchema;