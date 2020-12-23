/*@AlexWirthAAU
    Routen zur Abhandlung der logins.  
*/
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;


router.post('/', (req, res) => {
    const db = getDb();
    let email = req.body.email;
    let password = req.body.password;
    

    const statement = "SELECT u_password FROM users WHERE email = $1"
    const values = [email];

    db.query(statement, values, (err, result) => {
        if (err) {
            console.error("DB error: ", err.message)
            res.status(500).json({ message: "an error occured" });
        } else {
            console.log(result)
            res.status(200).json({ message: "user logedin" });
        }
    })
})
