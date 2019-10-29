const fs = require('fs');
const path = require('path');

class ObjectCache {
    dir;

    constructor(dir) {
        this.dir = dir;

        if(!fs.existsSync(dir))
            fs.mkdirSync(dir);
    }

    static filename(key) {
        return `${key}.tar`;
    }

    has(key) {
        const filepath = this.getPath(key);
        return fs.existsSync(filepath);
    }

    get(key) {
        const filepath = this.getPath(key);
        return this.has(key) ? fs.createReadStream(filepath) : null;
    }

    getPath(key) {
        return path.join(
            this.dir, ObjectCache.filename(key)
        );
    }

    put(key, object_file) {
        return object_file.pipe(
            fs.createWriteStream(
                path.join(
                    this.getPath(key)
                )
            )
        );
    }
}

module.exports = ObjectCache;