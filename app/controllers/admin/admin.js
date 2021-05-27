

const config = require("../../../config/config")
const commenFunction = require('../../middlewares/common')
const UsersModel = require('../../models/users');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
const TransactionModal = require('../../models/transactions')
class adminAuth {
    constructor() {
        return {
            loginAdmin: this.loginAdmin.bind(this),
            getUser: this.getUser.bind(this),
            getTransaction: this.getTransaction.bind(this)
        }
    }

    async loginAdmin(req, res) {
        try {
            let { email, password } = req.body
            let getUser = await UsersModel.findOne({ $and: [{ email: email }, { login_type: 'manual' }, { user_type: 'admin' }] },
                { username: 1, email: 1, Referral_id: 1, password: 1, login_type: 1 }).lean()
            console.log("getUser", getUser)
            if (getUser) {
                let verifypass = await bcrypt.compareSync(password, getUser.password);
                if (verifypass) {
                    let stoken = {
                        _id: getUser._id,
                        email: getUser.email
                    }
                    getUser.token = await jwt.sign(stoken, authConfig.secret, { expiresIn: '7d' });
                    res.json({ code: 200, success: true, message: 'login successfully', data: getUser })
                } else {
                    res.json({ code: 404, success: false, message: 'invalid password', })
                }
            } else {
                res.json({ code: 404, success: false, message: 'Email is not register', })
            }
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }
    async getUser(req, res) {
        try {
            let options = {
                page: req.body.page || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                lean: true,
                // select: 'name user_type minner_Activity createdAt',
            }
            let query = {
                user_type: 'user'
            }
            let getUser = await UsersModel.paginate(query, options)
                // { name: 1, user_type: 1, minner_Activity: 1, createdAt: 1 }).lean()
            // console.log("getUser", getUser)
            res.json({ code: 200, success: true, message: "Get list successfully ",  data: getUser })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }

    async getTransaction(req, res) {
        try {
            let options = {
                page: req.body.page || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                lean: true,
                // select: 'name user_type minner_Activity createdAt',
            }
            let query = { }
            let getUser = await TransactionModal.paginate(query, options)
                // { name: 1, user_type: 1, minner_Activity: 1, createdAt: 1 }).lean()
            // console.log("getUser", getUser)
            res.json({ code: 200, success: true, message: "Get list successfully ",  data: getUser })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }
}



module.exports = new adminAuth();