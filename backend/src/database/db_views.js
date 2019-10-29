module.exports = {
    tasks: [
        {
            _id: "_design/task",
            views: {
                by_wid_and_name: {
                    map: function (doc) {
                        if(doc.name && doc.wid) {
                            emit([doc.wid, doc.name], {
                                name: doc.name,
                                _id: doc._id
                            });
                        }
                    }
                },
                by_wid: {
                    map: function (doc) {
                        if(doc.wid) {
                            emit(doc.wid, {
                                name: doc.name,
                                _id: doc._id
                            });
                        }
                    }
                },
            }
        }
    ]
};