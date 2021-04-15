var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var walletSchema = new Schema({
    wallet: {
        type: String
    },
    total_amount: {
        type: String,
        default: "0",
        trim: true
    },
    Currency_type: {
        type: String,
        default: "rs",
        trim: true
    },
    referral_ammount: {
        type: String,
        default: "0",
        trim: true
    },
    earning_ammount: {
        type: String,
        default: "0",
        trim: true
    },
    wallet_type: {
        type: String,
        enum: ['user', 'admin'],
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    status: {
        type: String 
    }

}, { versionKey: false, timestamps:true });

walletSchema.plugin(mongoosePaginate);
let Walletmodel = mongoose.model('wallet', walletSchema);
module.exports = Walletmodel;