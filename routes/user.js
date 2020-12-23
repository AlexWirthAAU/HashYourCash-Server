const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const checkAuth = require('../check_auth');

router.get("/", checkAuth, (req, res) => {
    const db = getDb();
    console.log("Midellware ending")



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