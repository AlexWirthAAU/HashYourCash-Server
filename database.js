let config = require('./config.json');
const { Client } = require('pg');

let client;

let initializeDB = new Promise((resolve, reject) => {
    client = new Client ({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.db,
        ssl: {
            rejectUnauthorized: false
          }
    });

client.connect((err) => {
    if(!err){
        console.log("Successfully connected to Heroku Database");
        resolve();
    }
    else{
        console.log("Error connecting to Database");
        console.log(err.stack);
        reject();
    }
});
});

function getDb(){
    if(!client){
        console.log("DB hast not been initialized.");
        return;
    }
    return client;
}

module.exports = {
    getDb,
    initializeDB
};