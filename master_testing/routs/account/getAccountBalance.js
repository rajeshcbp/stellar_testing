var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var request = require('request');
var stellarAccount = require('./../../schemas/accounts');
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');


//GET USER NOMINEES DETAILS===========================================================================================================

module.exports.getAccountBalance = function (req, res) {

	var publicKey = req.params.publicKey;

	stellarAccount.findOne({
		"publicKey": publicKey
	}, function (err, accountFound) {
		if (err) {
			console.log("ERROR in finding stellar account", err.message);
			res.status(500).json({
				"error": err.message
			});
			return;
		}
		if (accountFound) {

			if (accountFound.balance) {
				console.log("Stellar account Found in DB==================", accountFound);
				stellarAccount.findOne({
					"publicKey": publicKey
				}, {
					"secret": 0,
					"__v": 0
				},function (err, accountDetails) {
					if (err) {
						console.log("ERROR in finding stellar account", err.message);
						res.status(500).json({
							"error": err.message
						});
						return;
					}
					res.send(accountDetails);
				})

			} else {
				console.log("Stellar account Found in DB==================", accountFound);
				// the JS SDK uses promises for most actions, such as retrieving an account
				server.loadAccount(publicKey).then(function (account) {
					console.log('Balances for account: ' + publicKey);
					account.balances.forEach(function (balance) {
						console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
						stellarAccount.update({
							_id: accountFound._id
						}, {
							$set: {
								balance: balance.balance,
								type: balance.asset_type
							}
						}, {
							w: 1
						}, function (err, result) {
							if (err) {
								console.log("ERROR in updating balance", err.message);
								res.status(500).json({
									"error": err.message
								});
								return;
							}
							stellarAccount.findOne({
								"publicKey": publicKey
							},{
								"secret": 0,
								"__v": 0
							}, function (err, accountDetails) {
								if (err) {
									console.log("ERROR in finding stellar account", err.message);
									res.status(500).json({
										"error": err.message
									});
									return;
								}
								res.send(accountDetails);
							})
						})
					});
				});
			}
		} else {
			res.status(404).json({
				"message": "Stellar account not found for this public key"
			});
		}
	})
}