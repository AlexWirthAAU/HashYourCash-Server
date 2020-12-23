const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const checkAuth = require('../check_auth');

router.get("/", checkAuth, (req, res) => {
    const db = getDb();
    console.log("Midellware ending")

    const statement = "SELECT * FROM users WHERE u_id = $1";
    const values = [req.headers.u_id]

    db.query(statement, values, (err, result) => {
        if (err) {
            console.error("DB error when getting user: ", err.message)
        } else {
            res.status(200).json(result.rows[0]);
        }
    })



})

router.get("/emails", (req, res) => {
    const db = getDb();
    console.log("Request comming", req)

    const statement = "SELECT email FROM users";
    db.query(statement, (err, result) => {
        if(err) {
            console.error(err, "DB error");
            res.status(500).json({ message: "an error occured" });
        } else {
            console.log(result.rows);
            res.status(200).json(result.rows);
        }
    })
})




module.exports = router;