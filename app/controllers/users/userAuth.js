const config = require("../../../config/config")
const commenFunction = require('../../middlewares/common')
const NewsModel = require('../../models/news')
const BlogModel = require("../../models/blogs")
const UsersModel = require('../../models/users');
const walletModel = require('../../models/wallet')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth');
const Constants = require('../../utilities/constants')
const FcmTokenModel = require('../../models/fcmToken')
const NotificationModel = require('../../models/notification')
const Notification = require('../../middlewares/notification')
class users {
    constructor() {
        return {
            signUp: this.signUp.bind(this),
            verifyOtp: this.verifyOtp.bind(this),
            login: this.login.bind(this),
            UpdateProfile: this.UpdateProfile.bind(this),
            uploadeImage: this.uploadeImage.bind(this),
            getTeam: this.getTeam.bind(this),
            getUserDetails: this.getUserDetails.bind(this),
            getDashboard: this.getDashboard.bind(this),
            forgotPassword: this.forgotPassword.bind(this),
            verifyForgot: this.verifyForgot.bind(this),
            setForgotPass: this.setForgotPass.bind(this),
            submitReferral: this.submitReferral.bind(this),
            minnerActivity: this.minnerActivity.bind(this),
            chekUserName: this.chekUserName.bind(this),
            chekRedditUserName: this.chekRedditUserName.bind(this),
            resetPassword: this.resetPassword.bind(this),
            setFcmToken: this.setFcmToken.bind(this),
            sendNotificationToUser: this.sendNotificationToUser.bind(this)
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
                let dt = moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss");
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
                { username: 1, email: 1, Referral_id: 1, password: 1, login_type: 1, profile_pic: 1, name: 1 }).lean()
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
            let { _id, name, email, username, number, profile_pic, login_type, country, reddit_username, minner_Activity } = req.body
            console.log("getUser", name, email, username, number, profile_pic, login_type, country)
            let array = [{ _id: _id }, { login_type: login_type }]
            let query = { $and: array }
            if (email) {
                array.push({
                    email: email
                })
            }
            let getUser = await UsersModel.findOne(query).lean()
            console.log("getUser", getUser)
            if (getUser) {
                let updateData = {}
                if (name) {
                    updateData.name = name
                }
                if (username) {
                    updateData.username = username
                }
                if (number) {
                    if (getUser.number == "") {
                        this._addNumberReward(getUser._id)
                    }
                    updateData.number = number
                }
                if (country) {
                    updateData.country = country
                }
                if (profile_pic) {
                    updateData.profile_pic = profile_pic
                }
                if (minner_Activity) {
                    updateData.minner_Activity = minner_Activity
                    // this._activateMiner(_id)
                }

                if (reddit_username) {
                    if (getUser.reddit_username == "") {
                        this._addRedditReward(getUser._id)
                    }
                    updateData.reddit_username = reddit_username
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
                res.json({ code: 500, success: false, message: "Internal server error", })
            }
        }
    }


    async uploadeImage(req, res) {
        try {
            if (req.body.profile_pic) {
                let data = await commenFunction._uploadBase64Profile(req.body.profile_pic, 'ProfileImage')
                var path2 = data.replace(/\\/g, "/");
                res.json({ code: 200, success: true, message: 'uploade successfully', data: path2 })
            } else {
                res.json({ code: 400, success: false, message: "profile_pic is require", })
            }

        } catch (error) {
            res.json({ code: 400, success: false, message: "Internal server error", })
        }
    }
    async _getUserData(id) {
        try {
            let data = await UsersModel.findOne({ _id: id }, {
                // ref_to_users: 0,
                password: 0,
                block_user: 0,
                user_type: 0,
                is_email_verify: 0,
                is_number_verify: 0,
                is_super_admin: 0,
                number: 0
            }).lean()
            // let dt = moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss");
            // let endDate = moment(dt, "DD.MM.YYYY HH.mm.ss");
            // let startDate = moment(data.last_mining_time, "DD.MM.YYYY HH.mm.ss");

            // if (Number(endDate.diff(startDate, 'hours')) < 24) {
            //     data.active_miner = "0"
            // } else {
            //     data.active_miner = "1"
            // }
            return data
        } catch (error) {
            console.log("Error in catch", error)
        }
    }
    async getTeam(req, res) {
        try {
            let data
            let _id = req.query._id
            data = await UsersModel.findOne({ _id: _id }, { ref_to_users: 1 }).lean()
            let arrayList = [];
            if (data.ref_to_users) {
                for (let item of data.ref_to_users) {
                    let userData = {}
                    userData = await this._getUserData(item.id)
                    userData.status = item.status
                    userData.team_size = userData.ref_to_users ? userData.ref_to_users.length : 0
                    delete userData.ref_to_users
                    arrayList.push(userData)
                }
            }
            let total_minner = arrayList.length
            let active_minner = 0
            let inactive_minner = 0
            for (let item of arrayList) {
                if (item.minner_Activity == true) {
                    active_minner++
                } else {
                    inactive_minner++
                }
            }
            console.log("active_minner,,,,,,", active_minner, inactive_minner)
            let newData = {
                team: arrayList,
                active_minner: active_minner,
                inactive_minner: inactive_minner,
                total_minner: total_minner
            }
            res.json({ code: 200, success: true, message: 'uploade successfully', data: newData })
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
            // let dt = moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss");
            // let endDate = moment(dt, "DD.MM.YYYY HH.mm.ss");
            // let startDate = moment(data.last_mining_time, "DD.MM.YYYY HH.mm.ss");

            // if (Number(endDate.diff(startDate, 'hours')) < 24) {
            //     data.active_miner = "0"
            // } else {
            //     data.active_miner = "1"
            // }
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
            res.json({ code: 200, success: true, message: 'get successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async forgotPassword(req, res) {
        try {
            let data
            let { email } = req.body
            if (!email) {
                res.json({ success: false, message: "Email is required", })
            } else {
                data = await UsersModel.findOne({ email: email }).lean()
                if (!data) {
                    res.json({ code: 404, success: false, message: 'Email is not register', })
                } else {
                    let otp = await this.rendomOtp()
                    await commenFunction._sendMail(email, `This is your otp : ${otp}`, `Forgot Password `)
                    let updateData = await UsersModel.findOneAndUpdate({ email: email }, { $set: { forgot_otp: otp, forgot_otp_verify: false } }, { new: true }).lean()
                    res.json({ code: 200, success: true, message: `Otp send successfull temp ${updateData.forgot_otp}`, data: updateData })

                }
            }

        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async verifyForgot(req, res) {
        try {
            let data
            let { email, otp } = req.body
            data = await UsersModel.findOne({ email: email }).lean()
            if (!data) {
                res.json({ code: 404, success: false, message: 'Email is not register', })
            } else {
                if (data.forgot_otp == otp) {
                    data = await UsersModel.findOneAndUpdate({ email: email }, { $set: { forgot_otp_verify: true } }).lean()
                    res.json({ code: 200, success: true, message: `Otp verify successfully`, data: data })
                } else {
                    res.json({ code: 404, success: false, message: 'You have enter wrong otp' })
                }
            }

        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async setForgotPass(req, res) {
        try {
            let data
            let { email, newPassword } = req.body
            data = await UsersModel.findOne({ email: email }).lean()
            if (!data) {
                res.json({ code: 404, success: false, message: 'Email is not register', })
            } else {
                if (data.forgot_otp_verify == true) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(newPassword, salt);
                    data = await UsersModel.findOneAndUpdate({ email: email }, { $set: { password: hash, forgot_otp_verify: false } }).lean()
                    let stoken = {
                        _id: data._id,
                        email: data.email
                    }
                    data.token = await jwt.sign(stoken, authConfig.secret, { expiresIn: '7d' });
                    res.json({ code: 200, success: true, message: `Password set successfully`, data: data })
                } else {
                    res.json({ code: 404, success: false, message: 'Please verify your otp' })
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
            let team = await UsersModel.findOne({ _id: _id }).lean()
            let arrayList = [];
            if (team.ref_to_users) {
                for (let item of team.ref_to_users) {
                    let userData = {}
                    userData = await this._getUserData(item.id)
                    userData.team_size = userData.ref_to_users ? userData.ref_to_users.length : 0
                    delete userData.ref_to_users
                    userData.status = item.status
                    arrayList.push(userData)
                }
            }
            data.team = arrayList.length > 5 ? arrayList.splice(0, 5) : arrayList
            //////////////////get news///////////////////////
            let options = {
                page: req.body.page || 1,
                limit: req.body.limit || 2,
                sort: { createdAt: -1 },
                lean: true,
            }
            let getNews = await NewsModel.paginate({}, options)
            data.news = getNews.docs
            //////////////////////////get blogs/////////////////////////
            let getblogs = await BlogModel.paginate({}, options)
            data.blogs = getblogs.docs
            ////////////////////////////get wallet//////////////////////////
            let wallte = await walletModel.findOne({ user_id: _id }).populate('user_id', 'name username email user_type  minner_Activity last_mining_time').lean()
            wallte.total_amount = wallte.total_amount.toString()
            wallte.referral_ammount = wallte.referral_ammount.toString()
            wallte.earning_ammount = wallte.earning_ammount.toString()
            wallte.mining_ammount = wallte.mining_ammount.toString()

            data.wallet = wallte

            res.json({ code: 200, success: true, message: 'uploade successfully', data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async submitReferral(req, res) {
        try {
            let updateData
            let data
            let { referral_code, username } = req.body
            let getUser = await UsersModel.findOne({ username: username }).lean()
            if (getUser.submit_referral == true) {
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
                    await UsersModel.findOneAndUpdate({ username: username },
                        {
                            $set: {
                                from_referral_id: data._id,
                                submit_referral: true
                            }
                        }
                    ).lean()
                    //  await this._activateMiner(getUser._id )
                    await walletModel.findOneAndUpdate({ user_id: getUser._id }, {
                        $inc: {
                            referral_ammount: Constants.referral_ammount,
                            total_amount: Constants.referral_ammount
                        }
                    }).lean()
                    //reciver trasaction //send notifications
                    commenFunction._createHistory(getUser._id, null, Constants.referral_ammount, Constants.recieve, Constants.referral)
                    res.json({ code: 200, success: true, message: 'Submit successfully', data: data })
                } else {
                    res.json({ code: 404, success: false, message: 'Somthing went wrong' })
                }
            }
        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async minnerActivity(req, res) {
        try {
            let { _id, status } = req.body
            let data

            console.log("req.body", req.body)
            data = await UsersModel.findOne({ _id: _id })
            // console.log(data)
            // let dt = moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss");
            // let endDate = moment(dt, "DD.MM.YYYY HH.mm.ss");
            // let startDate = moment(data.last_mining_time, "DD.MM.YYYY HH.mm.ss");
            // Number(endDate.diff(startDate, 'hours')) < 24

            if (data.minner_Activity) {
                res.json({ code: 400, success: false, message: 'You have not click before 24 hour', })
            } else {
                if (status == true || status == 'true') {
                    await this._activateMiner(_id)

                    await walletModel.findOneAndUpdate({ user_id: _id }, {
                        $inc: {
                            mining_ammount: Constants.mining_ammount,
                            total_amount: Constants.mining_ammount
                        }
                    }).lean()
                    commenFunction._createHistory(_id, null, Constants.mining_ammount, Constants.recieve, Constants.mining)
                    await walletModel.findOneAndUpdate({ user_id: data.from_referral_id }, {
                        $inc: {
                            earning_ammount: Constants.earning_ammount,
                            total_amount: Constants.earning_ammount
                        }
                    }).lean()
                    commenFunction._createHistory(data.from_referral_id, null, Constants.earning_ammount, Constants.recieve, Constants.earning)
                    res.json({ code: 200, success: true, message: 'Status update successfully', })
                } else {

                    res.json({ code: 400, success: false, message: 'please send the correct status', })

                }

            }


        } catch (error) {
            console.log("Error in catch", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async _deactivateMiner(_id) {
        try {
            await UsersModel.findOneAndUpdate({ _id: _id }, {
                $set: {
                    minner_Activity: false,
                }
            }, { new: true })
        } catch (error) {
            console.log("error in catch _deactivateMiner", error)
        }

    }
    async _activateMiner(_id) {
        try {
            await UsersModel.findOneAndUpdate({ _id: _id }, {
                $set: {
                    minner_Activity: true,
                    last_mining_time: moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss")
                }
            }, { new: true })
            const minner = {
                _id: _id,
                _DeactivateMiner() {
                    setTimeout(() => {
                        console.log(`Rover says ${this._id}!`);
                        UsersModel.findOneAndUpdate({ _id: this._id }, {
                            $set: {
                                minner_Activity: false,
                                last_mining_time: ""
                            }
                        }, { new: true }).then(data1 => {
                            console.log("successfull")
                            FcmTokenModel.findOne({ userId: data1._id }).populate('userId').then(data2 => {
                                console.log("data2", data2)
                                let message = {
                                    title: "Press the mining button for earning",
                                    time: moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss")
                                }
                                let data = {
                                    fromName: "Admin",
                                    toName: data2.userId.name ? data2.userId.name : "",
                                    toId :data2.userId._id,
                                    fromId: "",
                                }
                                Notification._sendPushNotification(message, data2.fcmToken, data)
                            })
                        }).catch(err => console.log("err", err))
                    }, 1000 * 60 * 1
                    // 
                    );
                }
            }

            minner._DeactivateMiner();
            //send notifications
        } catch (error) {
            console.log("error in catch _activateMiner", error)
        }
        return

    }
    async chekUserName(req, res) {
        try {
            let getUser = await UsersModel.findOne({ username: req.body.username }).lean()
            if (getUser) {
                res.json({ code: 400, success: false, message: 'Username is not available', data: getUser.username })
            } else {
                res.json({ code: 200, success: true, message: 'User name is available', data: req.body.username })
            }
        } catch (error) {
            console.log("Error in catch chekUserName", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    // redit_user_name
    async chekRedditUserName(req, res) {
        try {
            let getUser = await UsersModel.findOne({ reddit_username: req.body.reddit_username }).lean()
            if (getUser) {
                res.json({ code: 400, success: false, message: 'Reddit username is not available', data: getUser.reddit_username })
            } else {
                res.json({ code: 200, success: true, message: 'Reddit username is available', data: req.body.reddit_username })
            }
        } catch (error) {
            console.log("Error in catch chekUserName", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async resetPassword(req, res) {
        try {
            let { oldPassword, newPassword, _id } = req.body
            let getUser = await UsersModel.findOne({ _id: _id }).lean()
            if (getUser) {

                let verifypass = await bcrypt.compareSync(oldPassword, getUser.password);
                if (verifypass) {
                    let update = await UsersModel.findOneAndUpdate({ _id: _id }, { $set: { password: newPassword } }, { new: true })
                    res.json({ code: 200, success: true, message: 'Password update successfully', data: update })
                } else {
                    res.json({ code: 400, success: true, message: 'Old password is invalid', data: getUser })
                }

            } else {
                res.json({ code: 400, success: false, message: 'user is not available', })
            }
        } catch (error) {
            console.log("Error in catch chekUserName", error)
            res.json({ success: false, message: "Internal server error", })
        }
    }
    async _addNumberReward(_id) {
        try {
            await walletModel.findOneAndUpdate({ user_id: _id }, {
                $inc: {
                    earning_ammount: Constants.number_reward,
                    total_amount: Constants.number_reward
                }
            }).lean()
            commenFunction._createHistory(_id, null, Constants.number_reward, Constants.recieve, Constants.earning)
        } catch (error) {
            console.log("error in catch _addNumberReward", error)
        }
        return
    }
    async _addRedditReward(_id) {
        try {
            await walletModel.findOneAndUpdate({ user_id: _id }, {
                $inc: {
                    earning_ammount: Constants.reddit_reward,
                    total_amount: Constants.reddit_reward
                }
            }).lean()
            commenFunction._createHistory(_id, null, Constants.reddit_reward, Constants.recieve, Constants.earning)
        } catch (error) {
            console.log("error in catch _addRedditReward", error)
        }
        return
    }

    async setFcmToken(req, res) {
        try {

            if (req.body.fcmToken) {
                let data
                let query = { status: 'active' }
                let setData = { fcmToken: req.body.fcmToken }
                if (req.body.userId) {
                    setData.userId = req.body.userId
                    query.userId = req.body.userId
                }
                console.log("query", query, "setData", setData)
                data = await FcmTokenModel.findOne(query);
                if (data) {
                    data = await FcmTokenModel.findOneAndUpdate(query, { $set: setData }, { new: true });
                } else {
                    let saveData = new FcmTokenModel(setData)
                    data = await saveData.save();
                }
                res.json({ code: 200, success: true, message: "Token set successfully", data: data })
            } else {
                res.json({ code: 403, success: false, message: "Fcm token is required", })
            }

        } catch (error) {
            console.log("error in catch", error)
            res.json({ code: 500, success: false, message: "Internal server error", })
        }
    }
    async sendNotificationToUser(req, res) {
        try {
            let { senderId, reciverId } = req.body
            if (!reciverId || !senderId) {
                return res.json({ code: 400, success: false, message: "Perameter is missing", })
            } else {
                console.log("senderId, ..reciverId..", senderId, reciverId)
                let fcmTokenData = await FcmTokenModel.findOne({ userId: reciverId }).populate('userId').lean()
                console.log("fcmTokenData", fcmTokenData)
                let senderDetails = await UsersModel.findOne({ _id: senderId }).lean()
                if (fcmTokenData) {
                    let message = {
                        title: "Press the mining button for earning",
                        time: moment().utcOffset("+05:30").format("DD.MM.YYYY HH.mm.ss")
                    }
                    let saveNotification = new NotificationModel({
                        title: message.title,
                        toId: reciverId,
                        fromId: senderId,
                        type: 'Remember'
                    })
                    await saveNotification.save()
                    let data = {
                        fromName: senderDetails ? senderDetails.name : "",
                        toName: fcmTokenData.userId.name ? fcmTokenData.userId.name : "",
                        toId : reciverId,
                        fromId: senderId,
                    }
                    let sendnotification = await Notification._sendPushNotification(message, fcmTokenData.fcmToken, data)
                    res.json({ code: 200, success: true, message: "Notification send successfully", })
                } else {
                    res.json({ code: 400, success: true, message: "Fcm token is not updated", })
                }
            }
        } catch (error) {
            console.log("error in catch", error)
            res.json({ code: 400, success: false, message: "Internal server error", })
        }
    }

}

module.exports = new users();