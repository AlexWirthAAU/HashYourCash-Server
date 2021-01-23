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
                                resolve("Passwort geändert")
                            }
                        })
                    }
                })
            })
        } else {
            reject("Passwort stimmt nicht überein")
        }
    })
}

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
