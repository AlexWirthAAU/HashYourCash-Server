/*@AlexWirthAAU
    Routen zur Abhandlung der logins.  
*/

const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cfg = require('../config.json')
const db = getDb();

router.post('/', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;


    //Datenbank-Abfrage wird async. abgehandelt um mehrere Requests zum gleichen Zeitpunkt zu ermöglichen
    getUserByEmail(password, email)
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.error("Rejected: ", err)
            res.status(500).json(err)
    })

    /*

    const statement = "SELECT * FROM users WHERE email = $1"
    const values = [email];

    db.query(statement, values, (err, result) => {
        if (err) {
            console.error("DB error: ", err.message)
            res.status(500).json({ message: "an error occured when logging in" });
        } else {
            if(result.rows.length > 1) {
                console.error("DB error (more than two pw): ", err.message)
                res.status(500).json({ message: "an error occured when logging in" });
            } else if(result.rows.length == 1) {
                bcryptjs.compare(req.body.password, result.rows[0].u_password, function(err, result_hash) {
                    if(err) {
                        console.error("Hashing error: ", err.message)
                        res.status(500).json({ message: "an error occured"})
                    }
                    if(result_hash) {
                        let token = jwt.sign({
                            u_id: result.rows[0].u_id
                        }, cfg.database.jwt_secret, {
                            expiresIn: '24h'
                        });

                        const text = "UPDATE users SET u_token = $1 WHERE email = $2";
                        const vals = [token, email]

                        db.query(text, vals, function(err, result_token_update){
                            if(err) {
                                console.error("DB-Error in updating: ", err.message)
                                res.status(500).json({message: "an error occured"});
                            } else {
                                console.log("Updating with token was successful")
                                res.status(200).json({
                                    u_id: result.rows[0].u_id,
                                    token: token,
                                });
                            }
                        })
                    } else {
                        res.status(500).json({ message: "Passwords do not"})
                    }
                })
            } else {
                res.status(500).json({ message: "an error occured" })
            }
        }
    })
    */
})

function getUserByEmail(password, email) {
    //Zuerst den betroffenen User-Datensatz aus der DB holen (mittels email)
    const statement = "SELECT * FROM users WHERE email = $1"
    const values = [email];

    return new Promise((resolve, reject) => {
        db.query(statement, values, (err, result) => {
            if(err) {
                reject(err);
                return;
            } else {
                if(result.rows.length > 1) {
                    console.error("DB error (more than two pw): ", err.message)
                    reject(err);
                } else if (result.rows.length == 1) {
                    //User-Datensatz wurde gefunden: gehashte pwords vergleichen 
                    bcryptjs.compare(password, result.rows[0].u_password, function(err, result_hash) {
                        if(err) {
                            console.error("Hashing error: ", err.message)
                            reject(err);
                        }
                        if(result_hash) {
                            //pwords stimmen über ein, also kann ein Token erzeugt und gespeichert werden
                            let token = jwt.sign({
                                u_id: result.rows[0].u_id
                            }, cfg.database.jwt_secret, {
                                expiresIn: '24h'
                            });
    
                            const text = "UPDATE users SET u_token = $1 WHERE email = $2";
                            const vals = [token, email]
    
                            db.query(text, vals, function(err, result_token_update){
                                if(err) {
                                    console.error("DB-Error in updating: ", err.message)
                                    reject(err)
                                } else {
                                    console.log("Updating with token was successful")
                                    resolve({
                                        u_id: result.rows[0].u_id,
                                        token: token,
                                    })
                                }
                            })
                        } else {
                            //Pwords stimmen nicht über ein
                            reject("Passwords do not Match")
                        }
                    })
                } else {
                    reject("An error occurred")
                }
            }
        })
    })


}

module.exports = router;
