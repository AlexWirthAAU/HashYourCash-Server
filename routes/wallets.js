//@Zoë Wallets hinzufügen

const payments = require('./payments');
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');


//Abfrage aller Wallets
router.get("/", checkAuth, (req, res) => {
    showW(req.headers.u_id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

router.get('/:w_id/amounts', checkAuth, (req, res) => {
    let walletId = req.params.w_id;
    payments.calcWalletAmounts(walletId)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

//neues Wallet erstellen
router.post('/', checkAuth, (req, res) => {
    let wallets = req.body;
    let userId = req.headers.u_id;

    createW(wallets, userId)
        .then(result => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

//Wallet initialisieren mit Wallet amount
router.post('/:w_id', checkAuth, (req, res) => {
    let firstP = req.body;
    let walletId = req.params.w_id

    changeStatus(walletId, firstP)
    initialP(firstP)
        .then(result => {
            res.status(200).json({ message: result });
        })
        .catch(err => {
            res.status(500).json({ message: err });
        })
})

//Wallet löschen
router.delete("/:wallet", checkAuth, (req, res) => {
    let walletId = req.params.wallet;

    deleteW(walletId)
    deleteP(walletId)
        .then((result) => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

//Wallet bearbeiten
router.put("/:wallet", checkAuth, (req, res) => {
    let walletId = req.params.wallet;
    let wallets = req.body;

    editW(walletId, wallets)
        .then((result) => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

//Rückgabe alle Wallets der user id
function showW(u_id) {
    const statement = "SELECT w_id, name, description, amount, is_initiated FROM wallet WHERE u_id = $1";
    const values = [u_id];

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

//neuer Eintrag in Wallet Table mit Daten und user id 
function createW(walletsData, u_id) {
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
        })
    })
}

//Löschanfrage um Wallet zu löschen
function deleteW(walletId) {
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
        })
    })

}

//Löschung aller Payments aus der DB mit gegebener Wallet id
function deleteP(walletId){
    return new Promise((resolve, reject) => {
        const statement = "DELETE FROM payments WHERE w_id = $1";
        const values = [walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Zahlungen von Wallet gelöscht")
            }
    }
        )})

}

//Wallet bearbeiten mit neuen Werten 
function editW(walletId, walletData) {
    return new Promise((resolve, reject) => {
        const statement = "UPDATE wallet SET name = $1, description = $2, amount = $3 WHERE w_id = $4";
        const values = [walletData.name, walletData.description, walletData.amount, walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Wallet geändert")
            }
        })
    })

}

//Wallet von nicht initialisiert auf initialisiert setzen
function changeStatus(walletId, firstP) {
    return new Promise((resolve, reject) => {
        const statement = "UPDATE wallet SET is_initiated = $1 WHERE w_id = $2";
        const values = [firstP.is_initiated, walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Wallet geändert")
            }
        })
    })

}

//erste Zahlung auf das Wallet verbuchen 
function initialP(firstP) {
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO payments (type, amount, description, comment, w_id, entry_date) VALUES($1, $2, $3, $4, $5, $6)"
        const values = [firstP.type, firstP.amount, firstP.description, firstP.comment, firstP.w_id, firstP.entry_date];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Wallet wurde initialisiert")
            }
        })
    })
}

module.exports = router;
