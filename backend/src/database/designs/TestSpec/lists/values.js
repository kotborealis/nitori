module.exports = function(head, req) {
    var res = [];
    while(row = getRow()){
        res.push(row.value);
    }
    return toJSON(res);
}