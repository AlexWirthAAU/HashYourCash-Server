//@Zoë

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


//Mail ändern
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

//PW ändern
router.post('/password', checkAuth, (req, res) => {
    let passData = req.body;
    let userId = req.headers.u_id;

    changePw(passData, userId)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

function changePw(passData, u_id) {
    return new Promise((resolve, reject) => {
        //vergleich eingegebenes PW mit gehashtem passwort
    bcryptjs.compare(passData.oldPw, passData.currentPw, function(err, result_hash) {
        if(err) {
            reject(err.message);
        }
        if(result_hash) {
            //wenn übereinstimmt hash neues pw und safe in db
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
                                //informiere User über PW änderung
                                const emailMessage = {
                                    to: passData.email,
                                    from: 'hashyourcash@gmail.com',
                                    subject: 'Passwort wurde geändert!',
                                    html: '<h2><strong>Dein Passwort wurde gerade geändert!</strong></h2><p> Falls du deine Daten nicht geändert haben solltest, dann setze schnellstmöglich dein Passwort zurück. Folge dazu diesem Link:</p><p><a title="HashYourCash Passwort zurücksetzen" href="https://hashyourcashapp.herokuapp.com/forgotpw">https://hashyourcashapp.herokuapp.com</a></p><p>Falls es zu Problemen kommen sollte, dann melde dich per Mail bei uns:</p><p>hashyourcash@gmail.com</p><p>Dein HashYourCash Team</p>'
                                };
        
                                sgMail.send(emailMessage)
                                .then(res => {
                                    resolve({
                                        message: "Passwort geändert",
                                        pw: hash
                                    })
                                })
                                .catch(err => {
                                    reject("EMAIL NOT SENT ", err.message)
                                })
                            }
                        })
                    }
                })
            }
        else {
            reject("Passwort stimmt nicht überein")
        }
    })
})
}

function changeMail(mailData, u_id) {
    //neue Mail zu jeweiligem User speichen
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
