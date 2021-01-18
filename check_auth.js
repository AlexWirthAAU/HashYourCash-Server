let cfg = require('./config.json')
const jwt = require('jsonwebtoken');
const getDb = require("./database").getDb;
const db = getDb();

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    checkAuth(token, req)
        .then(u_id => {
            req.headers.u_id = u_id;
            next();
        })
        .catch(err => {
            if (err === "DB ERROR") {
                res.status(500).json({ message: err })
            } else {
                res.status(401).json({ message: "Authentication failed" })
            }
        })

}

function checkAuth(token, req) {

    return new Promise((resolve, reject) => {
        if (token === null) {
            reject("NO TOKEN")
        } else {
            jwt.verify(token, cfg.database.jwt_secret, (err, data) => {
                if (err) {
                    console.error("TOKEN VERIFICATION FAILED")
                    reject("TOKEN VERIFICATION FAILED")
                } else {

                    const statment = "SELECT * FROM users WHERE u_id = $1 AND u_token = $2";
                    const values = [data.u_id, token]

                    db.query(statment, values, (err, result) => {
                        if (err) {
                            console.error("DB error when checking Token: ", err.message)
                            reject("DB ERROR")
                        } else {
                            if (result.rows.length != 1) {
                                reject("AUTHENTICATION FAILED")
                            } else {
                                console.log("-----CHECK PARAMS--------: ", req.params)
                                if (req.params.w_id) {
                                    const stmt = "SELECT * FROM wallet WHERE u_id = $1 AND w_id = $2";
                                    const vals = [data.u_id, req.params.w_id]

                                    db.query(stmt, vals, (err, result) => {
                                        if (err) {
                                            console.error("ERROR WHEN ASKING FOR WALLET AUTH: ", err.message)
                                            reject("WALLET AUTH ERROR")
                                        } else {
                                            if (result.rows.length > 0) {
                                                resolve(data.u_id)
                                            } else {
                                                reject("WALLET AUTH ERROR")
                                            }
                                        }
                                    })
                                } else {
                                    resolve(data.u_id)
                                }

                            }
                        }
                    })
                }
            })
        }
    })

}