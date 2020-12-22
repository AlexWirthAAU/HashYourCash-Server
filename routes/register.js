/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const bcryptjs = require('bcryptjs');
const saltRounds = 10;


router.post('/', async (req, res) => {
    const db = getDb();
    let data = req.body;

    bcryptjs.hash(data.password, saltRounds, function (err, hash) {
        if (err) {
            console.error(err , "Hash error");
            res.status(500).json({ message: "an error occured" });
        } else {
            const statement = "INSERT INTO users (email, u_password, first_name, last_name) VALUES ($1, $2, $3, $4)";
            const values = [data.email, hash, data.first_name, data.last_name,];

            db.query(statement, values, (err, result) => {
                if (err) {
                    console.error(err, "DB error");
                    res.status(500).json({ message: "an error occured" });
                } else {
                    res.status(200).json({ message: "user registered" });
                }
            })
        }
    })
})

router.get("/emails", (req, res) => {
    const db = getDb();

    const statement = "SELECT * FROM users";
    db.query(statement, (err, result) => {
        if(err) {
            console.error(err, "DB error");
            res.status(500).json({ message: "an error occured" });
        } else {
            console.log(result);
            res.status(200).json({ message: "emails logged" });
        }
    })
})



module.exports = router;