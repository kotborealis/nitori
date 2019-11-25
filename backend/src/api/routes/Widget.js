const {Router} = require('express');
const Database = require('../../database');

module.exports = (config) => {
    const router = Router();
    const db = new Database(require('nano')(config.database), config.database.name);

    router.route('/list')
        .get(async (req, res) => {
            const {docs} = await db.find({
                selector: {
                    type: "TestSpec"
                },
                fields: ["wid"]
            });

            res.json(
                docs
                    .map(doc => doc.wid)
                    .filter((value, index, self) =>
                        self.indexOf(value) === index
                    )
            );
        });

    return router;
};