/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/

const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const cfg = require('../config.json')
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail')
const db = getDb();

sgMail.setApiKey(cfg.sendgrid.key);

router.post('/request', (req, res) => {
    let email = req.body.email;
    console.log(req.body)

    initForgotPw(email)
        .then(result => {
            res.status(200).json({ message: result })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })


})

router.post('/reset', (req, res) => {
    let password = req.body.password;
    let token = req.body.token;

    resetPW(password, token)
        .then(result => {
            res.status(200).json({ message: result })
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })

})

function resetPW(password, token) {

    return new Promise((resolve, reject) => {
        if (token === null) {
            console.error("No token")
            reject("NO TOKEN")
        } else {
            jwt.verify(token, cfg.database.jwt_secret, (err, result) => {
                if (err) {
                    console.error("Error with token")
                    reject("TOKEN ERROR")
                } else {

                    const statment = "SELECT u_token FROM users WHERE u_id = $1";
                    const values = [result.u_id]

                    db.query(statment, values, (error, res) => {
                        if (error) {
                            console.error("Error with DB query: ", err.message)
                            reject("ERROR WITH DB QUERY")
                        } else if (res.rows.length != 1) {
                            console.error("DB error when checking Token: ", err.message)
                            reject("DB ERROR TOKEN")
                        } else {
                            console.log("Token found");
                            if (res.rows[0].u_token === token) {

                                bcryptjs.hash(password, saltRounds, function (errHash, hash) {
                                    if (errHash) {
                                        console.error("Hashing Error: ", errHash.message);
                                        reject("HASHING ERROR");
                                    } else {

                                        const text = "UPDATE users SET u_password = $1 WHERE u_id = $2";
                                        const vals = [hash, result.u_id];

                                        db.query(text, vals, (errReset, resReset) => {
                                            if (errReset) {
                                                console.error("DB error resetpw: ", errReset.message);
                                                reject("DB RESET PW ERROR")
                                            } else {
                                                console.log("Password reset")
                                                resolve("PASSWORD RESET")
                                            }
                                        })

                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })

}

function initForgotPw(email) {
    console.log("Email: ", email)
    const statement = "SELECT * FROM users WHERE email = $1"
    const values = [email];

    return new Promise((resolve, reject) => {
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR")
                reject("DB ERROR");
                return;
            } else {
                console.log(result.rows)
                if (result.rows.length === 1) {
                    //User-Datensatz gefunden --> erzeuge neuen Token und sende email

                    let token = jwt.sign({
                        u_id: result.rows[0].u_id
                    }, cfg.database.jwt_secret, {
                        expiresIn: '30m'
                    });

                    const text = "UPDATE users SET u_token = $1 WHERE email = $2";
                    const vals = [token, email]

                    db.query(text, vals, function (err, result_token_update) {
                        if (err) {
                            console.error("DB-Error in updating: ", err.message)
                            reject(err)
                        } else {
                            console.log("Updating with token was successful")

                            const URL = '<p><a title="New Password" href="https://hashyourcashapp.herokuapp.com/resetpw/' + token + '">https://hashyourcashapp.herokuapp.com/resetpw</a></p>'

                            const emailMessage = {
                                to: email,
                                from: 'hashyourcash@gmail.com',
                                subject: 'Setze dein Passwort zurück',
                                html: '<h1 style="color: #5e9ca0;"><span style="color: #333333;">Passwort vergessen?</span></h1><p>Du hast dein Passwort vergessen. Unter folgendem Link kannst du ein neues vergeben:</p>' + URL + '<p>&nbsp;</p><p>(Falls du die Erneuerung deines Passworts nicht angefordert hast, kannst du diese Email ignorieren)</p><p>&nbsp;</p><p><strong>&nbsp;</strong></p>'
                            };

                            sgMail.send(emailMessage)
                                .then(res => {
                                    console.log("Email sent...")
                                    resolve("FINISHED")
                                })
                                .catch(err => {
                                    reject("EMAIL NOT SENT ", err.message)
                                })
                        }
                    })
                } else {
                    console.log("Email not found!")
                    reject("EMAIL NOT FOUND");
                }
            }
        })
    })
}



module.exports = router;