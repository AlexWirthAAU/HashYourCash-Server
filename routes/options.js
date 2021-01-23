const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const sgMail = require('@sendgrid/mail');
const cfg = require('../config.json')
sgMail.setApiKey(cfg.sendgrid.key);


router.post('/mail', checkAuth, (req, res) => {
    let mailData = req.body;
    let userId = req.headers.u_id;

    changeMail(mailData, userId)
        .then(result => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

router.post('/password', checkAuth, (req, res) => {
    let passData = req.body;
    let userId = req.headers.u_id;

    changePw(passData, userId)
        .then(result => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

function changePw(passData, u_id) {
    bcryptjs.compare(passData.oldPw, passData.currentPw, function(err, result_hash) {
        if(err) {
            console.error("Hashing error: ", err.message)
            reject(err.message);
        }
        if(result_hash) {
            return new Promise((resolve, reject) => {
                const statement = "UPDATE users SET u_password = $1 WHERE u_id = $2";
                const values = [hash, u_id];
                db.query(statement, values, (err, mailResponse) => {
                    if (err) {
                        console.error("DB ERROR: ", err.message);
                        reject(err.message)
                    } else {
                        bcryptjs.hash(passData.newPw, saltRounds, function (err, hash) {
                            if (err) {
                                console.error("ERROR WITH HASHING", err.message)
                                reject(err.message)
                            } else {
                                const statement = "UPDATE users SET u_password = $1 WHERE u_id = $2";
                                const values = [hash, u_id];
                                db.query(statement, values, (err, result) => {
                                    if (err) {
                                        console.error("DB ERROR: ", err.message);
                                        reject(err.message)
                                    } else {
                                        const emailMessage = {
                                            to: mailResponse.email,
                                            from: 'hashyourcash@gmail.com',
                                            subject: 'Passwort wurde geändert!',
                                            html: '<h2><strong>Dein Passwort wurde gerade geändert!</strong></h2><p>Falls du dein Passwort nicht geändert haben solltest, dann setze es schnellstmöglich unter folgendem Link zurück:</p><p><a title="HashYourCash Passwort Zurücksetzen" href="https://hashyourcashapp.herokuapp.com/forgotpw">https://hashyourcashapp.herokuapp.com</a></p><p><em>Falls du Schwierigkeiten haben solltest melde dich bei uns: hashyourcash@gmail.com!</em></p>'
                                        };
                
                                        sgMail.send(emailMessage)
                                        .then(res => {
                                            resolve("User informed PW change")
                                        })
                                        .catch(err => {
                                            reject("EMAIL NOT SENT ", err.message)
                                        })
                                    }
                                })
                            }
                        })   
                    }
                    })
                })}
         else {
            //Passwort stimmt nicht mit eingegebenen überein
            reject("Passwords do not Match")
         }

})}

function changeMail(mailData, u_id) {
    return new Promise((resolve, reject) => {
        const statement = "UPDATE users SET email = $1 WHERE u_id = $2";
        const values = [mailData.newMail, u_id];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Mail geändert")
            }
        })
    })

}




module.exports = router;
