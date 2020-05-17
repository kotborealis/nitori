const {Schema} = require('mongoose');

const {ExecOutputSchema} = require('./ExecOutput');
const {SourceFileSchema} = require('./SourceFile');

const TestTargetSchema = Schema({
    name: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now
    },
    userData:
    require('./UserData').UserDataSchema,
    testSpec: {
        type: Schema.Types.ObjectID,
        ref: 'TestSpec',
        required: true
    },
    compilerResult: ExecOutputSchema,
    linkerResult: ExecOutputSchema,
    runnerResult: ExecOutputSchema,
    sourceFiles: [SourceFileSchema],
});

module.exports.TestTargetSchema = TestTargetSchema;