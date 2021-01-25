/**
 * @AlexWirthAAU
 * Routen zur Abhandlung der Registrierung.  
 * E-Mail wird mittels Sendgrif gesendet. 
*/
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const db = getDb();
const sgMail = require('@sendgrid/mail');
const cfg = require('../config.json')
sgMail.setApiKey(cfg.sendgrid.key);


router.post('/', (req, res) => {
    let data = req.body;

    register(data)
        .then(result => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

function register(data) {

    return new Promise((resolve, reject) => {
        //Passwort wird gehashed
        bcryptjs.hash(data.password, saltRounds, function (err, hash) {
            if (err) {
                console.error("ERROR WITH HASHING", err.message)
                reject(err.message)
            } else {
                //Nutzerdaten werden in DB gespeichert
                const statement = "INSERT INTO users (email, u_password, first_name, last_name) VALUES ($1, $2, $3, $4)";
                const values = [data.email, hash, data.first_name, data.last_name,];

                db.query(statement, values, (err, result) => {
                    if (err) {
                        console.error("DB ERROR: ", err.message);
                        reject(err.message)
                    } else {
                        //Nutzer wird über erfolgreiche Registrierung informiert
                        const emailMessage = {
                            to: data.email,
                            from: 'hashyourcash@gmail.com',
                            subject: 'Herzlich Willkommen!',
                            html: '<h2><strong>Herzlich Willkommen bei HashYourCash!</strong></h2><p>Du hast dich vor kurzem bei HashYourCash registriert! Du kannst dich nun einloggen und deine Einnahmen und Ausgaben tracken. Folge dazu diesem Link:</p><p><a title="HashYourCash Login" href="https://hashyourcashapp.herokuapp.com">https://hashyourcashapp.herokuapp.com</a></p><p><em>Vielen Dank f&uuml;r dein Vertrauen!</em></p>'
                        };

                        sgMail.send(emailMessage)
                        .then(res => {
                            resolve("USER REGISTERED")
                        })
                        .catch(err => {
                            reject("EMAIL NOT SENT ", err.message)
                        })
                    }
                })
            }
        })
    })

}


module.exports = router;