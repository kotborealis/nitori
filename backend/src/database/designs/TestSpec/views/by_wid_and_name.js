module.exports = {
    map: function(doc) {
        if(doc.type && doc.type === "TestSpec" && doc.name && doc.wid){
            emit([doc.wid, doc.name], doc);
        }
    }
};