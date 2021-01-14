const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();
const checkAuth = require('../check_auth');

router.get("/:w_id", checkAuth, (req, res) => {
    showP(req.params.w_id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

router.post('/', checkAuth, (req, res) => {
    let payments = req.body;

    createP(payments)
        .then(result => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

router.delete("/:p_id", checkAuth, (req, res) => {
    let paymentId = req.params.p_id;

    deleteP(paymentId)
        .then((data) => {
            res.status(200).json({message: result});
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

router.post("/period", (req, res) => {
    //Middleware!!
    getCategories()
    .then((data) => {
        console.log("DATA: ", data)
    })
    .catch(err => {
        console.log("ERROR: ", err.message)
    })
})

function createP(paymentData) {
    return new Promise((resolve, reject) => {
        const statement = "INSERT INTO payments (type, amount, description, comment, c_id, pe_id, w_id, entry_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
        db.query(statement, Object.values(paymentData), (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Payment erstellt")
            }
        })
    })
}

function showP(w_id) {
    const statement = "SELECT * FROM payments WHERE w_id = $1 ORDER BY entry_date ASC";
    const values = [w_id];

    return new Promise((resolve, reject) => {
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB error when getting payments: ", err.message);
                reject("DB ERROR: ", err.message);
            } else {
                resolve(result.rows)
            }
        })
    })
}

function deleteP(paymentId) {
    return new Promise((resolve, reject) => {
        const statement = "DELETE FROM payments WHERE p_id = $1";
        const values = [paymentId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Payment gelöscht")
            }
        })
    })
}

function getPaymentsByDate(period, walletId) {
    




}

function getCategories () {
    return new Promise((resolve, reject) => {
        const statement = "SELECT * FROM category"

        db.query(statement, (err, result) => {
            if(err) {
                console.error("DB ERROR WHEN ASKING FOR CATEGORIES: ", err.message);
                reject(err.message)
            } else {
                resolve(result.rows)
                console.log("ALL CATS: ", result.rows)
            }
        })
    })
}


module.exports = router;
