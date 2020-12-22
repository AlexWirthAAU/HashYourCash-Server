/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/
const express = require('express');
const router = express.Router();


router.post('/', (req, res) => {
    const db = getDb();
    console.log(req.formData);
    res.status(200).json({message: "user registered"});
})

module.exports = router;