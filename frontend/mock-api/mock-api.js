const dev_config = (() => {
    try{
        return require('../../backend/.config.dev.js');
    }
    catch(e){
        return {api: {port: 3000}};
    }
})();

module.exports = [
    {
        context: ['/api/v1'],
        target: `http://127.0.0.1:${dev_config.api.port}`,
        pathRewrite: {'^/api/v1': ''},
        headers: {
            Cookie: 'PHPSESSID=qwerty'
        }
    },
    {
        bypass: (req, res) => {
            if(req.url.indexOf('/auth/user_data.php') < 0) return '/index.html';

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