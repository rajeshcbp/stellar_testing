var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var request = require('request');
var stellarAccount = require('./../../schemas/accounts');

//GET USER NOMINEES DETAILS===========================================================================================================

module.exports.listOfAllAccounts = function (req, res) {

	stellarAccount.find({}, {
		"__v": 0
	}, function (err, result) {
		if (err) {
			console.log("ERROR in get user details findone()", err.message);
			res.status(500).json({
				"error": err.message
			});
			return;
		}
		console.log("Accounts==================", result);
		res.send(result);
	})

}