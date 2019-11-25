module.exports = {
    views: {
        by_id: {
            map: function(doc) {
                if(doc.type && doc.type === 'TestTarget'){
                    emit(doc._id, {_id: doc._id});
                }
            }
        }
    }
};