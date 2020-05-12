const {Schema} = require('mongoose');

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
    compilerResult:
    require('./ExecOutput').ExecOutputSchema,
    linkerResult:
    require('./ExecOutput').ExecOutputSchema,
    runnerResult:
    require('./ExecOutput').ExecOutputSchema,
    sourceFiles: [{
        type: Schema.Types.ObjectID,
        ref: 'SourceFile',
        required: true
    }],
});

module.exports.TestTargetSchema = TestTargetSchema;