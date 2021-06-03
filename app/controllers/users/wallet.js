const config = require("../../../config/config")
const commenFunction = require('../common/Common')
const UsersModel = require('../../models/users');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
const walletModel = require('../../models/wallet')
class users {
    constructor() {
        return {
            getWallet: this.getWallet.bind(this),
            
            getRank: this.getRank.bind(this),
            // submitReferral: this.submitReferral.bind(this)
        }
    }

    //create wallet Api

    async getWallet(req, res) {
        try {
            let data
            let _id = req.query._id
            data = await walletModel.findOne({ user_id: _id }).populate('user_id','name username email user_type ').lean()
            res.json({ code: 200, success: true, message: 'Get successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({code: 500, success: false, message: "Somthing went wrong", })
        }
    }
    async getRank(req, res) {
        try {
            let data
            let _id = req.query._id
// { $group : {_id:'$_id', ct:{$sum:1}}}, { $sort :{ ct: -1}}
            data = await walletModel.aggregate({$unwind:"$ListOfStudent"},  );
            res.json({ code: 200, success: true, message: 'Get successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({code: 500, success: false, message: "Somthing went wrong", })
        }
    }



}

module.exports = new users();