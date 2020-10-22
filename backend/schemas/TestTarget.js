const {Schema} = require('mongoose');

const {ExecOutputSchema} = require('./ExecOutput');
const {SourceFileSchema} = require('./SourceFile');

const TestTargetSchema = Schema({
    timestamp: {
        type: Number,
        required: true,
        default: Date.now
    },
    userData: require('./UserData').UserDataSchema,
    testSpec: {
        type: Schema.Types.ObjectID,
        ref: 'TestSpec',
        required: true,
        index: true
    },
    widget: {
        type: Schema.Types.ObjectID,
        ref: 'Widget',
        required: true,
        index: true
    },
    targetCompilerResult: ExecOutputSchema,
    specCompilerResult: ExecOutputSchema,
    linkerResult: ExecOutputSchema,
    runnerResult: ExecOutputSchema,
    sourceFiles: [SourceFileSchema],
});

module.exports.TestTargetSchema = TestTargetSchema;