/*@AlexWirthAAU
    Routen zur Abhandlung der registration.  
*/

app.post('/', (req, res) => {
    console.log(req);
    res.status(200).json({message: "user registered"});
})