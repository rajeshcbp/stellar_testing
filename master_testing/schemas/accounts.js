var mongoose = require('mongoose');

// stellar account details 
var accountsSchema = mongoose.Schema({
	name: { //body
		type: String,
		index: true
	},
	email: { //body
		type: String,
		index: true
	},
	phone: { //body
		type: String,
		index: true
	},
	fedarationId: { //body
		type: String,
		index: true
	},
	publicKey: { //body
		type: String,
		index: true
	},
	secret: { //body
		type: String,
		index: true
	},
	balance: { //body
		type: String,
		default: null
	},
	type: { //body
		type: String,
		default: null
	}
});



//------------------------------------------Model---------------------------------------------------------------------------
var account = module.exports = mongoose.model('accounts', accountsSchema);