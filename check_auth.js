let cfg = require('./config.json')
const jwt = require('jsonwebtoken');
const getDb = require("./db").getDb;

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    if(token === null) {
        return res.status(401).json({ message: "Authentication failed" });
    } else {
        jwt.verify(token, cfg.auth.jwt, (err, data) => {
            if(err) {
                return res.status(401).json({ message: "Authentication failed" });
            } else {
                console.log("After token verification: ", data);
                next();
            }
        })
    }
}