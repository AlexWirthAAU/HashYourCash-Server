//@Zoë Abrufen und erstellen aller categorien

const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;
const db = getDb();

//alle Kategorien aus der DB abrufen
router.get('/', (req,res) => {
    getAllCats()
    .then(categories => {
        res.status(200).json(categories);
    })
    .catch(err => {
        res.status(500).json({ message: "an error occured: " + err.message })
    })
})

function getAllCats(){
    return new Promise((resolve, reject) => {
        const statement = "SELECT * FROM category"

        db.query(statement, (err, result) => {
            if (err) {
                console.error("DB error when getting category names: ", err.message);
                reject("DB ERROR: ", err.message);
            } else {
                resolve(result.rows);
            }
        })
    })
}

module.exports = router;