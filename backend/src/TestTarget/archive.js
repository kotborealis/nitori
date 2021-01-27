const {TestTargetModel} = require('../database/index');
const tar = require('tar-stream');
const aggregations = require('../../schemas/aggregations/TestTargetsByUsersByTestSpecs');
const {Types: {ObjectId}} = require('mongoose');

async function archiveTestTargets(widgetId) {
    const testTargets = await TestTargetModel
        .aggregate(aggregations.TestTargetsByUsersByTestSpecs({
            widgetId: ObjectId(widgetId), includeSources: true
        }));

    const userDirectory = (userData) => {
        if(!userData.name.trim())
            return userData.login;

        const name = userData.name.toLowerCase().split(' ');
        return `${name[0]}_${name[1][0]}_${name[2][0]}`;
    };

    const testTargetDirectory = (timestamp) => {
        const date = new Date(timestamp);
        const fmt = d => d.toString().padStart(2, 0);
        return `${date.getFullYear()}`
               + `.${fmt(date.getMonth() + 1)}`
               + `.${fmt(date.getDay())}`
               + `_${fmt(date.getHours())}`
               + `-${fmt(date.getMinutes())}`
               + `-${fmt(date.getSeconds())}`;
    };

    const tarball = tar.pack();

    testTargets.forEach(({userData, testTargetsByTestSpec}) =>
        testTargetsByTestSpec.forEach(({testSpec, testTargets}) =>
            testTargets.forEach(({sourceFiles, timestamp}) =>
                sourceFiles
                    .forEach(({name, content}) => tarball.entry({
                        name: `${userDirectory(userData)}/${testSpec.name}`
                              + `/${testTargetDirectory(timestamp)}/${name}`,
                        type: 'file',
                        mode: 0o644
                    }, content))
            )
        )
    );

    tarball.finalize();

    return tarball;
}

module.exports.archiveTestTargets = archiveTestTargets;