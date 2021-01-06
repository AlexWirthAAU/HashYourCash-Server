//@Zoë Wallets hinzufügen


const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();

router.post('/', (req, res) => {
    let wallets = req.body;

    createW(wallets)
        .then(result => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

function createW(wallets){
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO Wallet (name, description, amount) VALUES ($1, $2, $3)";
        const values = [wallets.name, wallets.description, wallets.amount];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Wallet erstellt")
            }
    }
        )})
}


module.exports = router;