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
            // uploadeImage: this.uploadeImage.bind(this),
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
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }



}

module.exports = new users();