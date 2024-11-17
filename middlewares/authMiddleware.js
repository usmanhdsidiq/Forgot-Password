const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if(!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) {
            return res.status(403).send('Access denied. Invalid token.');
        }

        req.user = user;
        next();
    });
};