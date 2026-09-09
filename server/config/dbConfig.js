const mongoose = require('mongoose');

//connection logic
mongoose.connect(process.env.CONN_STRING);

//connection state
const db = mongoose.connection;

//check DB connection 
db.on('connected',()=>{
    console.log('db connection successful')
})

db.on('err',()=>{
    console.log("connection failed")
})

module.exports = db;
