var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var stellarAccount = require('./../../schemas/accounts');
var StellarSdk = require('stellar-sdk');
var request = require('request');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const GDAX = require("gdax");
const publicClient = new GDAX.PublicClient();
//CREATE===========================================================================================================

module.exports.createNewAccount = function (req, res) {
	// create a completely new and unique pair of keys
	// see more about KeyPair objects: https://stellar.github.io/js-stellar-sdk/Keypair.html
	var pair = StellarSdk.Keypair.random();

	pair.secret(); // SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
	pair.publicKey(); // GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB

	console.log("pair-publicKey", pair.publicKey())
	console.log("pair-secret", pair.secret())

	// The SDK does not have tools for creating test accounts, so you'll have to make your own HTTP request.

	request.get({
		url: 'https://friendbot.stellar.org',
		qs: {
			addr: pair.publicKey()
		},
		json: true
	}, function (error, response, body) {
		if (error || response.statusCode !== 200) {
			console.error('ERROR!', error || body);
		} else {
			console.log('SUCCESS! You have a new account :)\n', body);
			var uniqueId = req.body.phone + "*cashstash.me"
			var formData = {
				"name": req.body.name,
				"email": req.body.email,
				"phone": req.body.phone,
				"fedarationId": uniqueId,
				"publicKey": pair.publicKey(),
				"secret": pair.secret()
			}
			console.log("formData", formData);
			stellarAccount.create(formData, function (err, result) {
				if (err) {
					console.log("DBERROR in creating account", err.message);
					res.status(500).json({
						"error": err.message
					});
					return;
				}
				console.log("User stellarAccount==================", body);
				res.status(200).json({
					"publicKey": result.publicKey,
					"body": body
				});
			})
		}
	});
}

module.exports.CheckPhone = function (req, res) {
	var phoneNum = req.params.phone;
	console.log("user phoneNum==================", phoneNum);

	stellarAccount.find({
		phone: phoneNum
	}, function (err, result) {

		if (err) {
			res.send({
				"code": 500,
				"failed": "error ocurred"
			})
			console.log(" error", err.message);
		}
		console.log("  User messages fetched succesfully ", result);
		//   log.info( "  User details fetched succesfully  " );
		res.status(200).json(result);

	})

}


module.exports.CheckEmail = function (req, res) {
	var userEmail = req.params.email;
	console.log("user Email==================", userEmail);
	stellarAccount.find({
		email: userEmail
	}, function (err, result) {

		if (err) {
			res.send({
				"code": 500,
				"failed": "error ocurred"
			})
			console.log(" error", err.message);
		}
		console.log("  User messages fetched succesfully ", result);
		//   log.info( "  User details fetched succesfully  " );
		res.status(200).json(result);

	})
		
}

module.exports.getGdexProducts = function (req, res) {
	const callback = (error, response, data) => {
		if (error)
		   return console.dir(error);
		   res.status(200).json(data);
		//return console.dir(data);
	  }
	  publicClient.getProducts(callback);
	  
	  
}

module.exports.getGdexCurrencies = function (req, res) {
	const callback = (error, response, data) => {
		if (error)
		   return console.dir(error);
		   res.status(200).json(data);
		// return console.dir(data);
	  }
	  publicClient.getCurrencies(callback);
}

module.exports.getUserDetails = function (req, res) {
	stellarAccount.findOne({
		publicKey: req.params.publicKey
	}, function (err, result) {

		if (err) {
			res.send({
				"code": 500,
				"failed": "error ocurred"
			})
			console.log(" error", err.message);
		}
		console.log("  User details fetched succesfully ", result);
		//   log.info( "  User details fetched succesfully  " );
		res.status(200).json(result);

	})
}