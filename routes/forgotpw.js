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
        res.status(200).json({message: result})
    })
    .catch(err => {
        res.status(500).json({message: err.message})
    })


})

function initForgotPw (email) {
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

                            const URL = '<p><a title="New Password" href="https://hashyourcashapp.herokuapp.com/resetpw/$token' + token + '">https://hashyourcashapp.herokuapp.com/resetpw</a></p>'

                            const emailMessage = {
                                to: email,
                                from: 'hashyourcash@gmail.com',
                                subject: 'Hello from Sendgrid',
                                html: '<h1 style="color: #5e9ca0;"><span style="color: #333333;">Passwort vergessen?</span></h1><p>Du hast dein Passwort vergessen. Unter folgendem Link kannst du ein neues vergeben:</p><p>&nbsp;</p><p>(Falls du die Erneuerung deines Passworts nicht angefordert hast, kannst du diese Email ignorieren)</p><p>&nbsp;</p><p><strong>&nbsp;</strong></p>'
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