//@Zoë Wallets hinzufügen


const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');

router.get("/", checkAuth, (req, res) => {

    showW(req.headers.u_id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({ message: "an error occured: " + err.message });
        })
})



router.post('/', checkAuth, (req, res) => {
    let wallets = req.body;
    let userId = req.headers.u_id;

    createW(wallets, userId)
        .then(result => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

router.delete("/:wallet", checkAuth, (req, res) => {
    let walletId = req.params.wallet;

    deleteW(walletId)
        .then((data) => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: "an error occured: " + err.message });
        })
})

function showW(u_id){

        const statement = "SELECT w_id, name, description, amount FROM wallet WHERE u_id = $1";
        const values = [u_id]
    
        return new Promise((resolve, reject) => {
            db.query(statement, values, (err, result) => {
                if (err) {
                    console.error("DB error when getting wallets: ", err.message);
                    reject("DB ERROR: ", err.message);
                } else {
                    resolve(result.rows)
                }
            })
        })
}

function createW(walletsData, u_id){
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO wallet (u_id, name, description, amount) VALUES ($1, $2, $3, $4)";
        const values = [u_id, walletsData.name, walletsData.description, walletsData.amount];
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

function deleteW(walletId){
    return new Promise((resolve, reject) => {
        const statement = "DELETE FROM wallet WHERE w_id = $1";
        const values = [walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Wallet gelöscht")
            }
    }
        )})

}


module.exports = router;