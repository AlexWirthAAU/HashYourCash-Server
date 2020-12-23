let cfg = require('./config.json')
const jwt = require('jsonwebtoken');
const getDb = require("./database").getDb;

module.exports = (req, res, next) => {
    const db = getDb();
    const token = req.headers.authorization;
    console.log(token);

    if (token === null) {
        return res.status(401).json({ message: "Authentication failed" });
    } else {
        jwt.verify(token, cfg.database.jwt_secret, (err, data) => {
            if (err) {
                return res.status(401).json({ message: "Authentication failed" });
            } else {

                const statment = "SELECT * FROM users WHERE u_id = §1 AND u_token = $2";
                const values = [data.u_id, token]

                db.query(statment, values, (err, result) => {
                    if (err) {
                        console.error("DB error when checking Token: ", err.message)
                        res.status(500).json({ message: "an error occured" });
                    } else {
                        if (result.rows.length != 1) {
                            res.status(401).json({ message: "Authentication failed" })
                        } else {
                            req.headers.u_id = data.u_id;
                            next();
                        }
                    }
                })
            }
        })
    }
}