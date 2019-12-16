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
        }
    }
};