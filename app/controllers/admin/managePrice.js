

const config = require("../../../config/config")
const commenFunction = require('../common/Common')
const UsersModel = require('../../models/users');
const NewsModel = require('../../models/news')
const BlogModel = require('../../models/blogs')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
class ManagePrice {
    constructor() {
        return {
            create: this.create.bind(this)

            // submitReferral: this.submitReferral.bind(this)
        }
    }

    async create(req, res) {
        try {
            let { title, content, id, image} = req.body
           console.log("hiiii", title, content, id)
            let getData = await NewsModel.findOne({ title: title })

            if (getData) {
                res.json({ code: 422, success: false, message: 'this title is all ready exist', })
            } else {
                let obj = {
                    mining_rate: 0.0416,
                    created_by: '607e5136b24182674c4a8ed6',
                }
                let saveData = new NewsModel(obj)
                await saveData.save();
                res.json({ code: 200, success: true, message: 'news save successfully', })
            }

        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }
}



module.exports = new ManagePrice();