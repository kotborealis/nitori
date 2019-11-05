module.exports = [
    {
        context: ['/api/v1'],
        target: 'http://127.0.0.1:3000',
        pathRewrite: {'^/api/v1' : ''},
        headers: {
            Cookie: 'PHPSESSID=qwerty'
        }
    },
    {
        bypass: (req, res) => {
            if(req.url !== '/auth/user_data.php') return '/index.html';

            res.json({
                "userId": 5,
                "isAdmin": true,
                "login": "test-user",
                "name": "Иван Иванович Иванов",
                "groupId": 0,
                "groupName": "ЯКУБОВИЧ-05-20"
            });
        }
    }
];