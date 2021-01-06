//@Zoë Wallets hinzufügen


const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();

router.post('/', (req, res) => {
    let wallets = req.body;
    let id = req.headers.u_id;

    createW(wallets,id)
        .then(result => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

function createW(wallets, id){
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO wallet (name, description, amount) VALUES ($1, $2, $3)";
        const values = [wallets.name, wallets.description, wallets.amount];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                console.log(id);
                resolve("Wallet erstellt")
            }
    }
        )})
}


module.exports = router;