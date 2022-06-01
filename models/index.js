//몽고디비 연결
const mongoose = require("mongoose");
const connect = () =>{
mongoose.connect("mongodb+srv://test:sparta@cluster0.j1l8r.mongodb.net/login_page?retryWrites=true&w=majority", 
{ignoreUndefined: true}).catch((err) => {
    console.error(err);});
};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = connect;