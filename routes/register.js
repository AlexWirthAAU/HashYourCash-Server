/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const db = getDb();

router.post('/', async (req, res) => {
    const db = getDb();
    let data = req.body;

    bcryptjs.hash(data.password, saltRounds, function (err, hash) {
        if (err) {
            res.status(500).json({ message: "an error occured" });
        } else {
            const statement = "INSERT INTO user (email, password, first_name, last_name) VALUES (?, ?, ?, ?)";
            const values = [data.email, data.first_name, data.last_name, hash];

            db.query(statement, values, (err, res) => {
                if (err) {
                    res.status(500).json({ message: "an error occured" });
                } else {
                    res.status(200).json({ message: "user registered" });
                }
            })
        }
    })
})



module.exports = router;