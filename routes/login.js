/*@AlexWirthAAU
    Routen zur Abhandlung der logins.  
*/

const express = require('express');
const router = express.Router();
const getDb = require("../database").getDb;

router.post('/', function (req, res) {
    const db = getDb();
    let data = req.body;

    
})