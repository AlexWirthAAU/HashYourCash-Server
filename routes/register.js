/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/
const express = require('express');
const router = express.Router();


router.post('/', (req, res) => {
    console.log(req.body);
    res.status(200).json({message: "user registered"});
})

module.exports = router;