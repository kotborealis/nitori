const {Router} = require('express');
const {TestTargetModel} = require('../../../../database/index');
const compileTestTarget = require('../../../../TestTarget/compileTestTarget');
const {TestSpecModel} = require('../../../../database');
const tar = require('tar-stream');
const {Types: {ObjectId}} = require('mongoose');

module.exports = (config) => {
    const router = Router();

    router.route('/')
        .get(async function(req, res) {
            req.auth([({isAdmin}) => isAdmin === true]);

            const {
                limit,
                skip,
                testSpecId = "",
                userDataId = "",
                userDataLogin = ".*",
                userDataName = ".*",
                userDataGroupId = "",
                userDataGroupName = ".*",
                sortBy,
                orderBy
            } = req.query;

            const {widgetId} = req;

            const query = {
                widget: widgetId,
                'userData.login': {$regex: userDataLogin, $options: 'i'},
                'userData.name': {$regex: userDataName, $options: 'i'},
                'userData.groupName': {$regex: userDataGroupName, $options: 'i'}
            };

            const testTargets = await TestTargetModel
                .find(query, null, {limit, skip, lean: true})
                .sort({
                    [sortBy]: orderBy
                });

            res.mongo(testTargets);
        })
        .post(
            async (req, res) => {
                req.auth();

                const {userData} = req;
                const {widgetId} = req;
                const {testSpecId} = req.query;

                const testSpec = await TestSpecModel.findById(testSpecId);

                const sourceFiles = req.body;

                const testTarget = new TestTargetModel({
                    widget: widgetId,
                    userData,
                    testSpec: testSpecId,
                    sourceFiles
                });

                await testTarget.save();

                const result = await compileTestTarget(config, testSpec, testTarget);

                const {
                    targetCompilerResult,
                    specCompilerResult,
                    linkerResult,
                    runnerResult
                } = result;

                testTarget.targetCompilerResult = targetCompilerResult;
                testTarget.specCompilerResult = specCompilerResult;
                testTarget.linkerResult = linkerResult;
                testTarget.runnerResult = runnerResult;

                await testTarget.save();

                res.mongo(testTarget);
            });

    router.route('/total-count')
        .get(async (req, res) =>
            res.json(await TestTargetModel.countDocuments({widget: req.widgetId}))
        );

    function rus_to_latin(str) {

        var ru = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i',
            'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh',
            'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya'
        }, n_str = [];

        str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i');

        for(var i = 0; i < str.length; ++i){
            n_str.push(
                ru[str[i]]
                || ru[str[i].toLowerCase()] == undefined && str[i]
                || ru[str[i].toLowerCase()].toUpperCase()
            );
        }

        return n_str.join('');
    }

    router.route('/download')
        .get(async (req, res) => {
            const sourceData = await TestTargetModel.aggregate([
                {
                    '$match': {
                        'widget': ObjectId(req.widgetId)
                    }
                }, {
                    '$sort': {
                        'timestamp': 1
                    }
                }, {
                    '$group': {
                        '_id': '$userData.login',
                        'name': {
                            '$first': '$userData.name'
                        },
                        'sourceFiles': {
                            '$push': '$sourceFiles'
                        },
                        'timestamps': {
                            '$push': '$timestamp'
                        }
                    }
                }
            ]);

            const tarball = tar.pack();

            sourceData.forEach(({_id, name, sourceFiles, timestamps}) => {
                let rootName;
                if(name.trim()){
                    name = name.toLowerCase().split(' ');
                    rootName = `${name[0]}_${name[1][0]}_${name[2][0]}`;
                }
                else{
                    rootName = _id;
                }
                for(let i = 0; i < sourceFiles.length; i++){
                    const date = new Date(timestamps[i]);
                    const sources = sourceFiles[i];
                    const dateFormat =
                        `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, 0)}.${date.getDay().toString().padStart(2, 0)}_${date.getHours().toString().padStart(2, 0)}-${date.getMinutes().toString().padStart(2, 0)}-${date.getSeconds().toString().padStart(2, 0)}`;

                    sources
                        .forEach(({name, content}) => tarball.entry({
                            name: `${rootName}/${dateFormat}/${name}`,
                            type: 'file',
                            mode: 0o644
                        }, content));
                }
            });

            tarball.finalize();

            res.setHeader('Content-disposition', 'attachment; filename=' + 'sources.tar');
            res.setHeader('Content-type', `application/x-tar`);

            tarball.pipe(res);
        });

    router.route('/:testTargetId')
        .get(async (req, res) => {
            const {testTargetId} = req.params;
            const testTarget = await TestTargetModel.findById(testTargetId);

            if(!testTarget){
                const err = new Error("Not found");
                err.status = 404;
                throw err;
            }

            res.mongo(testTarget);
        });

    return router;
};