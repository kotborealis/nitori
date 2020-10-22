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
const TestTargetsByTestSpecsByUsers = ({widgetId, includeSources}) => [
    {
        '$match': {
            'widget': widgetId
        }
    }, {
        '$project': {
            'sourceFiles': includeSources
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
];

module.exports = {TestTargetsByTestSpecsByUsers};