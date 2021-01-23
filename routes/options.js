const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');


router.post('/mail', checkAuth, (req, res) => {
    let newMail = req.body;
    let userId = req.headers.u_id;

    changeMail(newMail, userId)
        .then(result => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

function changeMail(mail, u_id) {
    return new Promise((resolve, reject) => {
        const statement = "UPDATE users SET email = $1 WHERE u_id = $2";
        const values = [mail, u_id];
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
