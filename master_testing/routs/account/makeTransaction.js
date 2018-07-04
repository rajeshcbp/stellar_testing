var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var request = require('request');
var stellarAccount = require('./../../schemas/accounts');

//GET USER NOMINEES DETAILS===========================================================================================================

module.exports.sendTransaction = function (req, res) {

	var body = req.body;
	console.log("body==================", body);
	console.log("========================Stellar part ================================")
	var StellarSdk = require('stellar-sdk');
	StellarSdk.Network.useTestNetwork();
	var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
	var body = req.body;

	var sourceSecret = body.fromSecKey;
	var sourcePublic = body.fromPubKey;
	var sourceKeys = StellarSdk.Keypair.fromSecret(sourceSecret);


	var destinationId = body.toPubKey;
	var transAmount = body.amount;


	// Transaction will hold a built transaction we can resubmit if the result is unknown.
	var transaction;

	// First, check to make sure that the destination account exists.
	// You could skip this, but if the account does not exist, you will be charged
	// the transaction fee when the transaction fails.
	server.loadAccount(destinationId)
		// If the account is not found, surface a nicer error message for logging.
		.catch(StellarSdk.NotFoundError, function (error) {
			throw new Error('The destination account does not exist!');
		})
		// If there was no error, load up-to-date information on your account.
		.then(function () {
			return server.loadAccount(sourceKeys.publicKey());
		})
		.then(function (sourceAccount) {
			console.log("sourceAccount=====", sourceAccount)
			// Start building the transaction.
			transaction = new StellarSdk.TransactionBuilder(sourceAccount)
				.addOperation(StellarSdk.Operation.payment({
					destination: destinationId,
					// Because Stellar allows transaction in many currencies, you must
					// specify the asset type. The special "native" asset represents Lumens.
					asset: StellarSdk.Asset.native(),
					amount: transAmount
				}))
				// A memo allows you to add your own metadata to a transaction. It's
				// optional and does not affect how Stellar treats the transaction.
				.addMemo(StellarSdk.Memo.text('Test Transaction'))
				.build();
			// Sign the transaction to prove you are actually the person sending it.
			transaction.sign(sourceKeys);
			// And finally, send it off to Stellar!
			return server.submitTransaction(transaction);
		})
		.then(function (result) {
			console.log('Success! Results:', result);
			console.log("========================Stellar Transaction Done================================")
			//DB update
			server.accounts()
				.accountId(sourcePublic)
				.call()
				.then(function (sourceAccountResult) {
					console.log("=====================================================================")
					console.log("From account details", sourceAccountResult);
					console.log("=====================================================================")
					console.log('Type:', sourceAccountResult.balances[0].asset_type, ', Balance:', sourceAccountResult.balances[0].balance);
					stellarAccount.update({
						publicKey: sourcePublic
					}, {
						$set: {
							balance: sourceAccountResult.balances[0].balance,
							type: sourceAccountResult.balances[0].asset_type
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
						console.log("========================From account details updated in DB================================")
						//DB update
						server.accounts()
							.accountId(destinationId)
							.call()
							.then(function (destAccountResult) {
								console.log("=====================================================================")
								console.log("Destination account details", destAccountResult);
								console.log("=====================================================================")
								console.log('Type:', destAccountResult.balances[0].asset_type, ', Balance:', destAccountResult.balances[0].balance);
								stellarAccount.update({
									publicKey: destinationId
								}, {
									$set: {
										balance: destAccountResult.balances[0].balance,
										type: destAccountResult.balances[0].asset_type
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
									console.log("========================To account details updated in DB================================")
									res.status(200).json({
										"message": "SUCCESS"
									});
								})
							})
							.catch(function (err) {
								console.error(err);
							})
					})
				})
				.catch(function (err) {
					console.error(err);
				})
		})
		.catch(function (error) {
			console.error('Something went wrong!', error);
			// If the result is unknown (no response body, timeout etc.) we simply resubmit
			// already built transaction:
			// server.submitTransaction(transaction);
		});
}