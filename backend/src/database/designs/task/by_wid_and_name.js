module.exports = {
    map: function(doc) {
        if(doc.type && doc.type === "task" && doc.name && doc.wid){
            emit([doc.wid, doc.name], {_id: doc._id});
        }
    }
};