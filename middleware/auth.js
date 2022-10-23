const { User } = require('../models/User');

let auth = (req, res, next) => {
    //Get token from client's cookie
    let token = req.cookies.x_auth;

    //Find User using token
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true });

        req.token = token;
        req.user = user;

        next();
    });
}

module.exports = { auth };