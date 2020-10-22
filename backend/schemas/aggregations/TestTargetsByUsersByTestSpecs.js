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
const TestTargetsByUsersByTestSpecs = ({widgetId, includeSources}) => [
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
                },
                ...(includeSources ? [] : [{
                    '$project': {
                        sourceFiles: 0,
                    }
                }]),
                {
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
];

module.exports = {TestTargetsByUsersByTestSpecs};