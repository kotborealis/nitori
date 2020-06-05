/**
 *
 * @param app Express.js App
 */
module.exports = (app) => {
    const authState = {
        auth: true,
        isAdmin: true
    };

    // auth API mock
    app.use('/auth/user_data.php', (req, res) => {
        if(!authState.auth)
            return res.status(400).end();

        res.json({
            userId: 5,
            isAdmin: authState.isAdmin,
            login: "test-user",
            name: "Иван Иванович Иванов",
            groupId: 0,
            groupName: "ЯКУБОВИЧ-05-20"
        });
    });

    // switch auth API mock state
    app.use('/auth/switch/auth', (req, res) => {
        authState.auth = !authState.auth;
        res.json(authState);
    });
    app.use('/auth/switch/admin', (req, res) => {
        authState.isAdmin = !authState.isAdmin;
        res.json(authState);
    });

    return authState;
};