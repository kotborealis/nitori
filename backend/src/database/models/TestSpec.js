module.exports = {
    views: {
        by_wid: {
            map: function(doc) {
                if(doc.type && doc.type === "TestSpec" && doc.wid){
                    emit(doc.wid, doc);
                }
            }
        },
        by_wid_and_name: {
            map: function(doc) {
                if(doc.type && doc.type === "TestSpec" && doc.name && doc.wid){
                    emit([doc.wid, doc.name], doc);
                }
            }
        }
    },
    lists: {
        values: function(head, req) {
            var res = [];
            var row;
            while((row = getRow())){
                res.push(row.value);
            }
            return toJSON(res);
        }
    }
};