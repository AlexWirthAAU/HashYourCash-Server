/*
@AlexWirthAAU
*/

const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const checkAuth = require('../check_auth');
const db = getDb();

router.get("/", checkAuth, (req, res) => {

    getUser(req.headers.u_id)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({ message: "an error occured: " + err.message });
        })
})

router.get("/emails", (req, res) => {


    getEmailCheck()
        .then(isRegistered => {
            res.status(200).json(isRegistered);
        })
        .catch(err => {
            res.status(500).json({ message: "an error occured: " + err.message })
        })
})

function getUser(u_id) {

    const statement = "SELECT * FROM users WHERE u_id = $1";
    const values = [u_id]

    return new Promise((resolve, reject) => {
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB error when getting user: ", err.message);
                reject("DB ERROR: ", err.message);
            } else {
                resolve(result.rows[0])
            }
        })
    })
}

function getEmailCheck(email) {

    return new Promise((resolve, reject) => {
        const statement = "SELECT email FROM users";
        

        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB error when getting emails: ", err.message);
                reject("DB ERROR: ", err.message);
            } else {
                resolve(result.rows)
            }
        })
    })
}




module.exports = router;