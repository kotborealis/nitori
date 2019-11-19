module.exports = {
    map: function(doc) {
        if(doc.type && doc.type === "TestSpec" && doc.wid){
            emit(doc.wid, {_id: doc._id});
        }
    }
};