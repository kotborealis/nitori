/**
 * На выходе получаем массив структур UserData
 */
const Users = ({widgetId}) => [
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
];

module.exports = {Users};