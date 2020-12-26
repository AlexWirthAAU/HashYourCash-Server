let cfg = require('./config.json')
const jwt = require('jsonwebtoken');
const getDb = require("./database").getDb;
const db = getDb();

module.exports = (req, res, next) => {
    const db = getDb();
    const token = req.headers.authorization;

    checkAuth(token)
    .then(u_id => {
        req.headers.u_id = u_id;
        next();
    })
    .catch(err => {
        if(err === "DB ERROR") {
            res.status(500).json({ message: err })
        } else {
            res.status(401).json({ message: "Authentication failed" })
        }
    })
    
}

function checkAuth(token) {

    return new Promise((resolve, reject) => {
       if(token === null) {
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
                            resolve(data.u_id)
                        }
                    }
                })
            }
        })
       }
    })
    
}