module.exports = {
    map: function (doc) {
        if(doc.type && doc.type === 'test') {
            emit(doc._id, {_id: doc._id});
        }
    }
};