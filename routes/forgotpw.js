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
    .then(res => {
        res.status(200).json({message: res})
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

                            const emailMessage = {
                                to: 'alex@wirth.email',
                                from: 'hashyourcash@gmail.com',
                                subject: 'Hello from Sendgrid',
                                text: 'Hello! This is a test-email!'
                            };

                            sgMail.send(emailMessage)
                            .then(response => console.log("E-Mail sent..."))
                            .catch(err => console.error("Email not send: ", err.message))

                            resolve("FINISHED")
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