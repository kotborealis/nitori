const debug = require('debug')('nitori:api:filesHandler');

function fileSizesValid(files) {
    if(!files || Object.keys(files).length === 0) return true;
    return Object.keys(files).map(key => files[key].truncated).every(i => !i);
}

module.exports = (limits, maxFiles = 0) => function(req, res, next) {
    debug("Files handler");

    const {files} = req;

    if(!files){
        next();
        return;
    }

    if(!fileSizesValid(files)){
        const err = new Error(`File must be smaller than ${limits.fileSize} bytes`);
        err.reason = 'invalidFileSize';
        err.status = 400;
        next(err);
        return;
    }

    const sourceFiles = (Array.isArray(files["sources"]) ? files["sources"] : [files["sources"]]);

    req.sourceFiles = sourceFiles.map(({name, data: content, mimetype: content_type}) => ({
        name, content, content_type
    }));

    if(maxFiles !== 0 && req.sourceFiles.length > maxFiles) {
        const err = new Error(`Maximum ${maxFiles} source files must be specified`);
        err.reason = `Maximum ${maxFiles} source files must be specified`;
        err.status = 400;
        next(err);
        return;
    }

    if(!req.sourceFiles){
        const err = new Error("No source files specified");
        err.reason = "no source files";
        err.status = 400;
        next(err);
        return;
    }

    next();
};