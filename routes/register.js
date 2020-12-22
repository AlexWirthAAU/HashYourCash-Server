/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/
const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;


router.post('/', (req, res) => {
    const db = getDb();

    console.log(req.body);
    res.status(200).json({message: "user registered"});
})

module.exports = router;