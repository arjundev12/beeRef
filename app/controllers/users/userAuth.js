const config = require("../../../config/config")
const commenFunction = require('../../middlewares/common')
const NewsModel = require('../../models/news')
const BlogModel = require("../../models/blogs")
const UsersModel = require('../../models/users');
const walletModel = require('../../models/wallet')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
class users {
    constructor() {
        return {
            signUp: this.signUp.bind(this),
            verifyOtp: this.verifyOtp.bind(this),
            login: this.login.bind(this),
            UpdateProfile: this.UpdateProfile.bind(this),
            uploadeImage: this.uploadeImage.bind(this),
            submitReferral: this.submitReferral.bind(this),
            getTeam: this.getTeam.bind(this),
            getUserDetails: this.getUserDetails.bind(this),
            getDashboard: this.getDashboard.bind(this),
            forgotPassword: this.forgotPassword.bind(this)
            // uploadeImage: this.uploadeImage.bind(this),
            // submitReferral: this.submitReferral.bind(this)
        }
    }

    //create sign_up Api
    async _generateRefID() {
        try {
            let flage = false
            let fourDigitsRandom
            do {
                fourDigitsRandom = await Math.floor(1000 + Math.random() * 9000);
                let getData = await UsersModel.find({ Referral_id: fourDigitsRandom.toString() })
                if (getData.length > 0) {
                    flage = true
                } else {
                    flage = false
                }
            }
            while (flage);

            return '@' + fourDigitsRandom

        } catch (error) {
            throw error
        }

    }
    async rendomOtp() {
        try {
            let fourDigitsRandom
            fourDigitsRandom = await Math.floor(1000 + Math.random() * 9000);
            return fourDigitsRandom

        } catch (error) {
            throw error
        }

    }
    async signUp(req, res) {
        try {
            let saveData
            let data
            let stoken
            let error
            let { name, email, password, login_type, social_media_key } = req.body
            let username = email.substring(0, email.lastIndexOf("@"));
            let referral_id = await this._generateRefID()
            let getUser
            console.log("logintype ", login_type, social_media_key)
            if (login_type == 'manual') {
                getUser = await UsersModel.findOne({ $and: [{ email: email }, { login_type: login_type }, { user_type: 'user' }] })
                console.log("getUser", getUser)
                if (getUser) {
                    error = true
                } else {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);
                    saveData = new UsersModel({
                        name: name,
                        username: username,
                        email: email,
                        password: hash,
                        login_type: login_type,
                        Referral_id: referral_id

                    })
                    data = await saveData.save();
                    await commenFunction._createWallet(data._id, 'user')
                }
            } else if (social_media_key) {
                getUser = await UsersModel.findOne({ $and: [{ email: email }, { login_type: login_type }, { user_type: 'user' }] })
                if (getUser) {
                    data = await UsersModel.findOneAndUpdate(
                        {
                            $and: [{ email: req.body.email }, { login_type: login_type }]
                        },
                        {
                            $set: { social_media_key: social_media_key }
                        }, { new: true })

                } else {
                    saveData = new UsersModel({
                        name: name,
                        username: username,
                        email: email,
                        login_type: login_type,
                        Referral_id: rendomNumber,
                        social_media_key: social_media_key

                    })
                    data = await saveData.save();
                    await commenFunction._createWallet(data._id, 'user')
                }

            }
            if (data) {
                stoken = {
                    _id: data._id,
                    email: data.email
                }
                data.token = await jwt.sign(stoken, authConfig.secret, { expiresIn: '7d' });
                return res.json({ code: 200, success: true, message: 'Data save successfully', data: data })
            } else if (error) {
                res.json({ code: 404, success: false, message: 'Email already exist', data: getUser.email })
            } else {
                res.json({ success: false, message: "Somthing went wrong", })
            }

        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }

    }
    async verifyOtp(req, res) {
        try {

            let { number, otp } = req.body
            let getUser = await UsersModel.findOne({ number: Number(number) }).lean();
            console.log("getUser", getUser)
            if (getUser) {
                let dt = moment().format("DD.MM.YYYY HH.mm.ss");
                let endDate = moment(dt, "DD.MM.YYYY HH.mm.ss");
                let startDate = moment(getUser.otp_details.otp_time, "DD.MM.YYYY HH.mm.ss");
                console.log(",,,", getUser.otp_details.otp != Number(otp), getUser.otp_details.otp, Number(otp))
                if (getUser.otp_details.otp != Number(otp)) {
                    errorMessage = "Otp is invalid"
                }
                if (Number(endDate.diff(startDate, 'seconds')) > 120) {
                    errorMessage = "Time is expired"

                } if (Number(endDate.diff(startDate, 'seconds')) <= 120 && getUser.otp_details.otp == Number(otp)) {
                    getUser.otp_details.status = true
                    getUser.otp_details.otp = 0
                    data = await UsersModel.findOneAndUpdate({ _id: getUser._id }, getUser)
                    successMessage = "Otp verified successfully"
                }
            } else {
                errorMessage = "Authentication is Failed"
            }
            if (errorMessage) {
                res.json({ success: false, message: errorMessage })
            } else {
                res.json({ success: true, message: successMessage })
            }


        } catch (error) {
            console.log("error in catch", error)
            res.json({ success: false, message: "Internal server error", data: null })
        }

    }
    async login(req, res) {
        try {
            let { email, password } = req.body
            let getUser = await UsersModel.findOne({ $and: [{ email: email }, { login_type: 'manual' }, { user_type: 'user' }] },
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
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async UpdateProfile(req, res) {
        try {
            let { _id,name, email, username, number, profile_pic, login_type, country } = req.body
            console.log("getUser", name, email, username, number, profile_pic, login_type, country)
            let getUser = await UsersModel.findOne({ $and: [{ _id: _id },{ email: email }, { login_type: login_type }, { user_type: 'user' }] }).lean()
            console.log("getUser", getUser)
            if (getUser) {
                let updateData = {
                    name: name,
                    username: username,
                    number: number,
                }
                if (country) {
                    updateData.country = country
                }
                if (profile_pic) {
                    updateData.profile_pic = profile_pic
                }
                let updateUser = await UsersModel.findOneAndUpdate({ $and: [{ _id: _id },{ email: email }, { login_type: login_type }] }, { $set: updateData }, { new: true })
                if (updateUser) {
                    res.json({ code: 200, success: true, message: 'profile update successfully', data: updateUser })
                }
            } else {
                res.json({ code: 404, success: false, message: 'Email is not register', })
            }
        } catch (error) {
            console.log("Error in catch", error)
            if (error.codeName == 'DuplicateKey'){
                res.json({ code: 400, success: false, message: `${ Object.keys(error.keyValue)} is already exist`, })
            }else{
                res.json({code: 500, success: false, message: "Internal server error", })
            }
        }
    }

    async submitReferral(req, res) {
        try {
            let updateData
            let data
            let { referral_code, username } = req.body
            let getUser = await UsersModel.findOne({ username: username }).lean()
            if (getUser.minner_Activity == true) {
                res.json({ code: 404, success: false, message: 'you are already submit referral code' })
            } else {
                let getUserTo = await UsersModel.findOne({ Referral_id: referral_code }).lean()
                if (!getUserTo.ref_to_users) {
                    updateData = {
                        $addToSet: {
                            ref_to_users: {
                                status: "active",
                                id: getUser._id,
                            }
                        }
                    }

                    data = await UsersModel.findOneAndUpdate({ Referral_id: referral_code }, updateData, { new: true })
                } else {
                    let check = false;
                    for (let item of getUserTo.ref_to_users) {
                        console.log("236 line", item.id.toString() == getUser._id.toString(), typeof item.id, typeof getUser._id, item.id, getUser._id)
                        if (item.id.toString() == getUser._id.toString()) {
                            item.status = 'active'
                            check = true
                        }
                    }
                    if (!check) {
                        getUserTo.ref_to_users.push({
                            status: "active",
                            id: getUser._id,
                        })
                    }
                    console.log(getUserTo)
                    data = await UsersModel.findOneAndUpdate({ Referral_id: referral_code }, { $set: getUserTo }, { new: true })
                }
                if (data) {
                    await UsersModel.findOneAndUpdate({ username: username }, { minner_Activity: true }).lean()
                    res.json({ code: 200, success: true, message: 'profile update successfully', data: data })
                } else {
                    res.json({ code: 404, success: false, message: 'Somthing went wrong' })
                }
            }




        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async uploadeImage(req, res) {
        try {
            console.log("hiiiiiii", req.body, req.file)
            if (req.file) {
                res.json({ code: 200, success: true, message: 'uploade successfully', data: req.file })
            } else {
                res.json({ success: false, message: "Internal server error", })
            }

        } catch (error) {
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async _getUserData(id) {
        try {
            let data = await UsersModel.findOne({ _id: id }, {
                ref_to_users: 0,
                password: 0,
                block_user: 0,
                user_type: 0,
                is_email_verify: 0,
                is_number_verify: 0,
                is_super_admin: 0,
                number: 0
            }).lean()
            return data
        } catch (error) {
            console.log("Error in catch", error)
        }
    }
    async getTeam(req, res) {
        try {
            let data
            let _id = req.query._id
            data = await UsersModel.findOne({ _id: _id }, {ref_to_users: 1 }).lean()
            let arrayList = [];
            if (data.ref_to_users) {
                for (let item of data.ref_to_users) {
                    let userData = {}
                    userData = await this._getUserData(item.id)
                    userData.status = item.status
                    arrayList.push(userData)
                }
            }
            res.json({ code: 200, success: true, message: 'uploade successfully', data: arrayList })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }

    async getUserDetails(req, res) {
        try {
            let data
            let _id = req.query._id
            data = await UsersModel.findOne({ _id: _id }, {
                is_super_admin: 0,
                password: 0,
                createdAt: 0,
                __v: 0
            }).lean()
            let arrayList = [];
            if (data.ref_to_users) {
                for (let item of data.ref_to_users) {
                    let userData = {}
                    userData = await this._getUserData(item.id)
                    userData.status = item.status
                    arrayList.push(userData)
                }
            }
            data.team = arrayList
            delete data.ref_to_users;
            res.json({ code: 200, success: true, message: 'uploade successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async forgotPassword(req, res) {
        try {
            let data
            let {email} = req.body
            if(!email){
                res.json({ success: false, message: "email is required", })
            }else{
                data = await UsersModel.findOne({ email: email }).lean()
                if(!data){
                    res.json({ code: 404, success: false, message: 'email is not register', })
                 }else{
                    let otp = await this.rendomOtp()
                    await commenFunction._sendMail(email, `Forgot Password `, `This is your otp : ${otp}`)
                    let updateData = await UsersModel.findOneAndUpdate({ email: email },{$set: {forgot_otp: otp}},{new: true}).lean()
                  res.json({ code: 200, success: true, message: `Otp send successfull temp ${updateData.forgot_otp}`, data: updateData })
                     
                 }
            }
             
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }

    async getDashboard(req, res) {
        try {
            let data = {}
            let _id = req.query._id

            ///////////////////get team//////////////
            let team = await UsersModel.findOne({ _id: _id }, {ref_to_users: 1 }).lean()
            let arrayList = [];
            if (team.ref_to_users) {
                for (let item of team.ref_to_users) {
                    let userData = {}
                    userData = await this._getUserData(item.id)
                    userData.status = item.status
                    arrayList.push(userData)
                }
            }
            data.team  = arrayList.length > 5 ? arrayList.splice(0,5): arrayList
            //////////////////get news///////////////////////
            let options = {
                offset: req.body.offset || 0,
                limit: req.body.limit || 2,
                sort: { createdAt: -1 },
                lean: true,
            }
            let getNews = await NewsModel.paginate({}, options)
            data.news= getNews.docs
            //////////////////////////get blogs/////////////////////////
            let getblogs = await BlogModel.paginate({}, options)
            data.blogs = getblogs.docs
           ////////////////////////////get wallet//////////////////////////
            let wallte = await walletModel.findOne({ user_id: _id }).populate('user_id','name username email user_type ').lean()
            data.wallet = wallte
            res.json({ code: 200, success: true, message: 'uploade successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
}

module.exports = new users();