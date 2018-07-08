var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var JWT = require('jwt-simple');
var http = require('http');
var multer = require('multer');
var crypto = require('crypto');
var request = require('request');

const GDAX = require("gdax");
const publicClient = new GDAX.PublicClient();
//const Promise = require("bluebird");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//=======================================================HTML Pages=====================================================
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

//======================================================Connect to Mongoose================================================================

var promise = mongoose.connect('mongodb://sodiotech:sodio123@ds147030.mlab.com:47030/stellar_test_2', {
    useMongoClient: true,
    /* other options */
});

//=======================================================Routs============================================================================

//Account routs
var newAccount = require('./routs/account/createNewAccount');
var balance = require('./routs/account/getAccountBalance');
var accountsList = require('./routs/account/listOfAllAccounts');
var transaction = require('./routs/account/makeTransaction');

//=====================================================API'S===============================================================================
app.get("/GetGdexProducts", newAccount.getGdexProducts);
app.get("/GetGdexCurrencies", newAccount.getGdexCurrencies);

app.post("/CreateNewAccount", newAccount.createNewAccount);
app.get("/GetAllAccountsList", accountsList.listOfAllAccounts);
app.get("/GetAccountBalance/:publicKey", balance.getAccountBalance);

app.get("/GetUserDetails/:publicKey", newAccount.getUserDetails);

app.get("/CheckPhone/:phone", newAccount.CheckPhone);
app.get("/CheckEmail/:email", newAccount.CheckEmail);

app.post("/TransactionSend", transaction.sendTransaction);
//=========================================================================================================================================
const PORT = process.env.PORT || 3030;
app.listen(PORT);
console.log("Server connected to port" + " " + PORT);