module.exports = {
    views: {
        list: {
            map: function(doc) {
                if(doc.type === "Widget"){
                    emit(doc._id, doc._id);
                }
            }
        }
    }
};