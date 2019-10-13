const fs = require('fs');
const path = require('path');

class ObjectCache {
    dir;

    constructor(dir) {
        this.dir = dir;

        if(!fs.existsSync(dir))
            fs.mkdirSync(dir);
    }

    static filename(source_name, source_key) {
        return `${source_name.replace(/[\/\\]/g, '_')}@${source_key}.tar`;
    }

    has(source_key, source_name) {
        const filepath = this.getPath(source_name, source_key);
        return fs.existsSync(filepath);
    }

    get(source_key, source_name) {
        const filepath = this.getPath(source_name, source_key);
        return this.has(source_key, source_name) ? fs.createReadStream(filepath) : null;
    }

    getPath(source_name, source_key) {
        return path.join(
            this.dir, ObjectCache.filename(source_name, source_key)
        );
    }

    put(source_key, source_name, object_file) {
        return object_file.pipe(
            fs.createWriteStream(
                path.join(
                    this.getPath(source_name, source_key)
                )
            )
        );
    }
}

module.exports = ObjectCache;