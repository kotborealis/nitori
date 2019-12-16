/**
 * TestTarget model: views, lists, etc
 */
module.exports = {
    views: {
        list: {
            map: function(doc) {
                if(doc.type === "TestTarget"){
                    emit(doc._id, doc._id);
                }
            }
        }
    }
};