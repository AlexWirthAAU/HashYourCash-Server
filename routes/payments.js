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
    let payment = req.body;
    createP(payment)
        .then(result => {
            res.status(200).json({newWalletAmount: result});
        })
        .catch(err => {
            res.status(500).json({message: err});
        })
});

router.delete("/:p_id/:w_id", checkAuth, (req, res) => {
    let paymentId = req.params.p_id;
    let walletId = req.params.w_id;

    deleteP(paymentId, walletId)
        .then((data) => {
            res.status(200).json({newWalletAmount: data});
        })
        .catch(err => {
            res.status(500).json({message: "an error occured: " + err.message});
        })
});

router.post("/period/:w_id", checkAuth, (req, res) => {
    getPaymentsByDate(req.body, req.params.w_id)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({message: err.message});
        })
});

router.post("/periodInOut/:w_id", checkAuth, (req, res) => {
    getInAndOuts(req.body, req.params.w_id)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({message: err.message})
        })
});

function updateWalletAmount(walletId) {
    return calcWalletAmounts(walletId)
        .then(amounts => {
            return new Promise((resolve, reject) => {
                const statement = "UPDATE wallet SET amount = $1 WHERE w_id = $2";
                db.query(statement, [amounts.total, walletId], (err, result) => {
                    if (err) {
                        console.error("DB ERROR: ", err.message);
                        reject(err.message)
                    } else {
                        resolve(amounts.total)
                    }
                })
            })
        })
}

function createP(paymentData) {
    return new Promise((resolve, reject) => {
        let statement = "INSERT INTO payments (type, amount, description, comment, pe_id, w_id, c_id, entry_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8)";
        db.query(statement, Object.values(paymentData), (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve(result)
            }
        })
    }).then(result => updateWalletAmount(paymentData.w_id))
}

function showP(w_id) {
    const statement = `SELECT *
                       FROM payments p
                              LEFT JOIN category c ON p.c_id = c.c_id
                       WHERE p.w_id = $1
                       ORDER BY p.entry_date ASC`;
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

function deleteP(paymentId, walletId) {
    return new Promise((resolve, reject) => {
        const statement = "DELETE FROM payments WHERE p_id = $1 AND w_id = $2";
        const values = [paymentId, walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                resolve("Payment gelöscht")
            }
        })
    }).then(result => updateWalletAmount(walletId))
}

function getPaymentsByDate(period, walletId) {

    return new Promise((resolve, reject) => {
        let cats = [];
        let statisticsObj = {};
        getCategories()
            .then((data) => {
                cats = data;
                cats.forEach(cat => {
                    statisticsObj[cat.c_id] = {
                        'name': cat.name,
                        'amount': 0,
                        'color': cat.color,
                        'icon': cat.icon
                    };
                });

                var statement = "";
                var values = [];

                if (period.fromdate == "" || period.todate == "") {
                    statement = "SELECT amount, c_id FROM payments WHERE type = 'out' AND w_id = $1 ORDER BY c_id ASC";
                    values = [walletId]
                } else {
                    statement = "SELECT amount, c_id FROM payments WHERE type = 'out' AND w_id = $1 AND entry_date >= $2 AND entry_date <= $3 ORDER BY c_id ASC";
                    values = [walletId, period.fromdate, period.todate];
                }


                db.query(statement, values, (err, result) => {
                    if (err) {
                        console.error("DB ERROR WHEN ASKING FOR PAYMENTS: ", err.message)
                        reject(err)
                    } else {
                        result.rows.forEach(payment => {
                            statisticsObj[payment.c_id].amount += parseFloat(payment.amount);
                        });
                        resolve(statisticsObj)
                    }
                })
            })
            .catch(err => {
                console.log("ERROR: ", err.message);
                reject(err)
            })
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        const statement = "SELECT * FROM category";

        db.query(statement, (err, result) => {
            if (err) {
                console.error("DB ERROR WHEN ASKING FOR CATEGORIES: ", err.message);
                reject(err.message)
            } else {
                resolve(result.rows)
            }
        })
    })
}

function getInAndOuts(period, walletID) {
    return new Promise((resolve, reject) => {

        var statement = "";
        var values = [];
        var statisticsObj = {
            "in": 0,
            "out": 0,
        };

        if (period.fromdate == "" || period.todate == "") {
            statement = "SELECT amount, type FROM payments WHERE w_id = $1 ORDER BY c_id ASC";
            values = [walletID]
        } else {
            statement = "SELECT amount, type FROM payments WHERE w_id = $1 AND entry_date >= $2 AND entry_date <= $3 ORDER BY c_id ASC";
            values = [walletID, period.fromdate, period.todate];
        }

        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERREOR WHEN ASKING FOR IN AND OUTS");
                reject(err.message)
            } else {
                result.rows.forEach(payment => {
                    statisticsObj[payment.type] += parseFloat(payment.amount);
                });
                resolve(statisticsObj)
            }
        })
    })
}

function calcWalletAmounts(walletId) {
    return new Promise((resolve, reject) => {
        const statement = `
          select p.type as type, sum(p.amount) as amount
          from payments p
          where p.w_id = $1
          group by p.type
          union
          select 'total' as type,
                 sum(
                     case
                       when type = 'in' then
                         amount
                       else
                         amount * -1
                       end
                   )     as amount
          from payments p
          where p.w_id = $1
          group by p.w_id
        `;
        const values = [walletId];
        db.query(statement, values, (err, result) => {
            if (err) {
                console.error("DB ERROR: ", err.message);
                reject(err.message)
            } else {
                const amounts = {};
                amounts.in = parseInt(result.rows.filter(row => row['type'] === 'in')[0]['amount']);
                amounts.out = parseInt(result.rows.filter(row => row['type'] === 'out')[0]['amount']);
                amounts.total = parseInt(result.rows.filter(row => row['type'] === 'total')[0]['amount']);
                resolve(amounts)
            }
        })
    })
}


module.exports = {router, calcWalletAmounts};
