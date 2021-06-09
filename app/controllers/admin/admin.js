

const config = require("../../../config/config")
const commenFunction = require('../../middlewares/common')
const UsersModel = require('../../models/users');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
const TransactionModal = require('../../models/transactions')
const DocumentsModel = require('../../models/userDocument')
class adminAuth {
    constructor() {
        return {
            loginAdmin: this.loginAdmin.bind(this),
            getUser: this.getUser.bind(this),
            AdminUpdateUser: this.AdminUpdateUser.bind(this),
            getTransaction: this.getTransaction.bind(this),
            getKycDoc: this.getKycDoc.bind(this)
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
            let query = {}
            if (req.body.searchData) {
                query = {
                    user_type: 'user',
                    $or: [{ email: { $regex: req.body.searchData, $options: "i" } },
                    { name: { $regex: req.body.searchData, $options: "i" } },
                    { username: { $regex: req.body.searchData, $options: "i" } }]
                }
            }
            let getUser = await UsersModel.paginate(query, options)
            // { name: 1, user_type: 1, minner_Activity: 1, createdAt: 1 }).lean()
            // console.log("getUser", getUser)
            res.json({ code: 200, success: true, message: "Get list successfully ", data: getUser })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }
    async AdminUpdateUser(req, res) {
        try {
            let { _id, name, email, username, number, profile_pic, login_type, country, reddit_username, minner_Activity ,is_number_verify,is_complete_kyc} = req.body
            // console.log("getUser", name, email, username, number, profile_pic, login_type, country)
            // let array = [{ _id: _id }, { login_type: login_type }]
            let query = {_id: _id }
            // if (email) {
            //     array.push({
            //         email: email
            //     })
            // }
            let getUser = await UsersModel.findOne(query).lean()
            // console.log("getUser", getUser)
            if (getUser) {
                let updateData = {}
                if (name && name != "") {
                    updateData.name = name
                }
                if (username && username != "") {
                    updateData.username = username
                }
                if (number && number != "") {
                    updateData.number = number
                    // updateData.is_number_verify = "2"
                }
                if (country && country != "") {
                    updateData.country = country
                }
                if (profile_pic && profile_pic != "") {
                    updateData.profile_pic = profile_pic
                }
                if (minner_Activity && minner_Activity != "") {
                    updateData.minner_Activity = minner_Activity
                }

                if (reddit_username && reddit_username != "") {
                    updateData.reddit_username = reddit_username
                }
                if (is_number_verify && is_number_verify != "") {
                    updateData.is_number_verify = is_number_verify
                }
                if (is_complete_kyc && is_complete_kyc != "") {
                    updateData.is_complete_kyc = is_complete_kyc
                }
                let updateUser = await UsersModel.findOneAndUpdate(query, { $set: updateData }, { new: true })
                res.json({ code: 200, success: true, message: 'profile update successfully', data: updateUser })
            } else {
                res.json({ code: 404, success: false, message: 'Email is not register', })
            }
        } catch (error) {
            console.log("Error in catch", error)
            if (error.codeName == 'DuplicateKey') {
                res.json({ code: 400, success: false, message: `${Object.keys(error.keyValue)} is already exist`, })
            } else {
                res.json({ code: 500, success: false, message: "Somthing went wrong", })
            }
        }
    }
    async getTotal(transaction_type ){
        let getUser 
        try {
             getUser = await TransactionModal.aggregate([
            {
                $group :{
                    _id: '$transaction_type',
                    totalAmount: {
                        $sum: "$amount"
                    },
                }
            }
        ])
        console.log("getUsertotal amount",getUser )
        } catch (error) {
            console.log("error in catch 88",error ) 
        }
         return getUser
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
            let query = {}
            let total_amount

            if (req.body.type && req.body.type != "") {
                query.type = req.body.type
            }
            if (req.body.transaction_type && req.body.transaction_type != "") {
                query.transaction_type = req.body.transaction_type
                console.log("req.body.transaction_typereq.body.transaction_type", req.body.transaction_type)
                total_amount= await this.getTotal()

            }
             if (req.body.toId && req.body.toId != "") {
                // { title: { $regex: searchData, $options: "i" }
                query.to_id = { $regex: req.body.toId, $options: "i" }
            } 
            if (req.body.todayDate && req.body.todayDate != "") {
                query.createdAt = { "$gte": new Date(req.body.todayDate).toISOString() }// + "T00:00:00Z" 
                query.createdAt["$lte"] = new Date(req.body.todayDate).toISOString()// + "T12:00:00Z"
            } 
            if (req.body.toDate && req.body.toDate != "") {
                query.createdAt = { "$lte": req.body.toDate + "T12:00:00Z" }
            } 
            if (req.body.fromDate && req.body.fromDate != "") {
                query.createdAt["$gte"] = new Date(req.body.fromDate)// + "T00:00:00Z"
            } 
            if (req.body.sort && req.body.sort != "") {
                options.sort = req.body.sort
            }
            let getUser = await TransactionModal.paginate(query, options)
            getUser.total_amount = total_amount
            res.json({ code: 200, success: true, message: "Get list successfully ", data: getUser })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }
    async getKycDoc(req, res ){
        try {
            let id = req.query.id
             let getUser = await DocumentsModel.findOne({owner: id})
             if(getUser){
                 res.json({code :200, success: true, message: "Get data successfully", data: getUser})
             }else{
                res.json({code :404, success: false, message: "Not found", data: getUser})
             }
        console.log("getUsertotal amount",getUser )
        } catch (error) {
            console.log("error in catch 88",error ) 
            res.json({code :404, success: false, message: "Not found"})
        }
    }
}



module.exports = new adminAuth();