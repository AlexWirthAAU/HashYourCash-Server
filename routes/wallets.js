//@Zoë Wallets hinzufügen


const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');

router.post('/', checkAuth, (req, res) => {
    let wallets = req.body;

    createW(wallets)
        .then(result => {
            //console.log(u_id + "in post")
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

function createW(walletsData, u_id){
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO wallet ( name, description, amount) VALUES ($1, $2, $3)";
        const values = [walletsData.name, walletsData.description, walletsData.amount];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                //console.log(u_id + "in function")
                resolve("Wallet erstellt")
            }
    }
        )})
}


module.exports = router;