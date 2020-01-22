/**
 * TestSpec model: views, lists, etc
 */
module.exports = {
    views: {
        list: {
            map: function(doc) {
                if(doc.type === "TestSpec"){
                    emit(doc._id, doc._id);
                }
            }
        },
        totalCount: {
            map: function(doc) {
                if(doc.type === "TestSpec" && doc.removed === false){
                    emit(doc.widgetId, 1);
                }
            },
            reduce: function(keys, values, combine) {
                return sum(values);
            }
        }
    }
};