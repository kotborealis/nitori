const debug = require('debug')('nitori:api:filesHandler');

function fileSizesValid(files) {
    return files.map(({truncated}) => truncated).every(i => !i);
}

module.exports = (limits, minFiles = -Infinity, maxFiles = Infinity) => function(req, res, next) {
    const files = Object.keys(req.files)
        .map(_ => req.files[_])
        .map(file => [file].flat())
        .flat();

    if(!fileSizesValid(files)){
        const err = new Error(`All files must be smaller than ${limits.fileSize} bytes`);
        err.status = 400;
        next(err);
        return;
    }

    if((minFiles !== -Infinity && files.length < minFiles) || (maxFiles !== Infinity && files.length > maxFiles)){
        const err = new Error(`Only ${minFiles}--${maxFiles} files must be specified`);
        err.status = 400;
        next(err);
        return;
    }

    if(!req.files){
        const err = new Error(`No files specified, but ${minFiles}--${maxFiles} files required`);
        err.status = 400;
        next(err);
        return;
    }

    req.files = files.map(({name, data: content, mimetype: content_type}) => ({
        name, content, content_type
    }));

    next();
};