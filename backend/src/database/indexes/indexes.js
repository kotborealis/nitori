/**
 * CouchDB indexes to create
 */
module.exports = {
    "timestamp-sorted-json": {
        fields: ["timestamp"]
    },
    "name-sorted-json": {
        fields: ["name"]
    }
};