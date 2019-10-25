module.exports = {
    '/auth/user_data.php': {
        bypass: (req, res) => res.json({
            "userId": 5,
            "isAdmin": false,
            "login": "test-user",
            "name": "Иван Иванович Иванов",
            "groupId": 0,
            "groupName": "ЯКУБОВИЧ-05-20"
        })
    }
};