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

router.post("/email", (req, res) => {

    console.log("Incomming mail: ", req.body)

    getEmailCheck(req.body.email)
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
        const statement = "SELECT u_id FROM users WHERE email = $1";
        const values = [email]

        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB error when getting emails: ", err.message);
                reject("DB ERROR: ", err.message);
            } else {
                if(result.rows.length > 0) {
                    resolve("true")
                } else {
                    resolve("false")
                }
                
            }
        })
    })
}




module.exports = router;