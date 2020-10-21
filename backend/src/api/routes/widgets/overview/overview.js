const {Router} = require('express');
const {TestSpecModel, TestTargetModel} = require('../../../../database');
const {Types: {ObjectId}} = require('mongoose');

module.exports = (config) => {

    const router = Router();

    router.route('/test-targets/users/test-specs')
        .get(async (req, res) => {

            const widgetId = ObjectId(req.widgetId);

            /**
             * На выходе получаем массив структур:
             * {
             *     userData: <object>
             *     testTargetsByTestSpec: <Array{
             *         testSpec: <TestSpec>
             *         testTargets: <Array{<TestTarget>}>
             *     }>
             * }
             */
            const testTargets = await TestTargetModel
                .aggregate([
                    {
                        '$match': {
                            'widget': widgetId
                        }
                    }, {
                        '$group': {
                            '_id': {
                                'userId': '$userData.userId',
                                'testSpec': '$testSpec'
                            },
                            'userData': {
                                '$first': '$userData'
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id.userId',
                            'testTargetsByTestSpec': {
                                '$push': '$_id.testSpec'
                            },
                            'userData': {
                                '$first': '$userData'
                            }
                        }
                    }, {
                        '$project': {
                            '_id': false
                        }
                    }, {
                        '$lookup': {
                            'let': {
                                'widget': widgetId,
                                'userId': '$userData.userId'
                            },
                            'from': 'testtargets',
                            'as': 'testTargetsByTestSpec',
                            'pipeline': [
                                {
                                    '$match': {
                                        '$expr': {
                                            '$and': [
                                                {
                                                    '$eq': [
                                                        '$widget', '$$widget'
                                                    ]
                                                }, {
                                                    '$eq': [
                                                        '$userData.userId', '$$userId'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }, {
                                    '$sort': {
                                        'timestamp': -1
                                    }
                                }, {
                                    '$group': {
                                        '_id': '$testSpec',
                                        'testTargets': {
                                            '$push': '$$ROOT'
                                        }
                                    }
                                }, {
                                    '$lookup': {
                                        'from': 'testspecs',
                                        'localField': '_id',
                                        'foreignField': '_id',
                                        'as': 'testSpec'
                                    }
                                }, {
                                    '$unwind': '$testSpec'
                                }, {
                                    '$project': {
                                        '_id': false
                                    }
                                }
                            ]
                        }
                    }
                ]);

            res.mongo(testTargets);
        });

    router.route('/test-targets/test-specs/users')
        .get(async (req, res) => {

            const widgetId = ObjectId(req.widgetId);

            /**
             * На выходе получаем массив структур:
             * {
             *     testSpec: <object>
             *     testTargetsByUser: <Array{
             *         userData: <object>
             *         testTargets: <Array{<TestTarget>}>
             *     }>
             * }
             */
            const testTargets = await TestSpecModel
                .aggregate([
                    {
                        '$match': {
                            'widget': widgetId
                        }
                    }, {
                        '$project': {
                            'testSpec': '$$ROOT',
                            '_id': false
                        }
                    }, {
                        '$lookup': {
                            'let': {
                                'widget': widgetId,
                                'testSpec': '$testSpec._id'
                            },
                            'from': 'testtargets',
                            'as': 'testTargetsByUser',
                            'pipeline': [
                                {
                                    '$match': {
                                        '$expr': {
                                            '$and': [
                                                {
                                                    '$eq': [
                                                        '$testSpec', '$$testSpec'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }, {
                                    '$sort': {
                                        'timestamp': -1
                                    }
                                }, {
                                    '$group': {
                                        '_id': '$userData.userId',
                                        'userData': {
                                            '$first': '$userData'
                                        },
                                        'testTargets': {
                                            '$push': '$$ROOT'
                                        }
                                    }
                                }, {
                                    '$project': {
                                        '_id': false
                                    }
                                }
                            ]
                        }
                    }
                ]);

            res.mongo(testTargets);
        });

    router.route('/users')
        .get(async (req, res) => {
            /**
             * На выходе получаем массив структур UserData
             */
            const testTargets = await TestTargetModel
                .aggregate([
                    {
                        '$group': {
                            '_id': '$userData.userId',
                            'userData': {
                                '$first': '$userData'
                            }
                        }
                    }, {
                        '$replaceRoot': {
                            'newRoot': '$userData'
                        }
                    }
                ]);

            res.mongo(testTargets);
        });

    return router;
};