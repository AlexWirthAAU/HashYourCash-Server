//Zoë
let config = require('./config.json');
const db = require('./database');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true})); //support encoded bodies
app.use(bodyParser.json()); //support json bodies

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const userRoutes = require('./routes/user');
const forgotpw = require('./routes/forgotpw');
const categories = require('./routes/categories');

app.use("/register", registerRoutes)
app.use("/login", loginRoutes)
app.use("/user", userRoutes)
app.use("/forgotpw", forgotpw)
app.use("/categories", categories)

app.get("/", (req, res) => {
    console.log("Received Standard Request");
    res.send("Hello world!");
})


const PORT = process.env.PORT || config.server.port;
db.initializeDB.then(() => {
    app.listen(PORT, () => {
        console.log("Listening on Port " + PORT)
    });
},
()=> {console.log("Failed to connect to DB!")})


console.log("Server is working")
