module.exports = {
    tasks: [
        {
            _id: "_design/task",
            views: {
                by_wid_and_name: {
                    map: function (doc) {
                        if(doc.name && doc.wid) {
                            emit([doc.wid, doc.name]);
                        }
                    }
                }
            }
        }
    ]
};