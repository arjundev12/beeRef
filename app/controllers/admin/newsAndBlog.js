

const config = require("../../../config/config")
const commenFunction = require('../common/Common')
const UsersModel = require('../../models/users');
const NewsModel = require('../../models/news')
const BlogModel = require('../../models/blogs')
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
class newsAndBlog {
    constructor() {
        return {
            createNews: this.createNews.bind(this),
            createBlogs: this.createBlogs.bind(this),
            uploadeImage: this.uploadeImage.bind(this),
            uploadeImagebase64: this.uploadeImagebase64.bind(this)
          

            // submitReferral: this.submitReferral.bind(this)
        }
    }

    async createNews(req, res) {
        try {
            let { title, content, id, image} = req.body
           console.log("hiiii", title, content, id)
            let getData = await NewsModel.findOne({ title: title })

            if (getData) {
                res.json({ code: 422, success: false, message: 'this title is all ready exist', })
            } else {
                let obj = {
                    title: title,
                    content: content,
                    created_by: '607e5136b24182674c4a8ed6',
                    image : image
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
   
    async createBlogs(req, res) {
        try {
            let { title, content, id, image} = req.body
            let obj = {
                title: title,
                content: content,
                created_by: '607e5136b24182674c4a8ed6',
                image : image
            }
            let getData = await BlogModel.findOne({ title: title })
            if (getData) {
                res.json({ code: 422, success: false, message: 'this title is all ready exist', })
            } else {
                let saveData = new BlogModel(obj)
                await saveData.save();
                res.json({ code: 200, success: true, message: 'blog save successfully', })
            }
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
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
    async uploadeImagebase64(req, res) {
        try {
            if (req.body.image) {
                let data = await commenFunction._uploadBase64image(req.body.image, 'NewsAndBlogs')
                var path2 = data.replace(/\\/g, "/");
                res.json({ code: 200, success: true, message: 'uploade successfully', data: path2 })
            } else {
                res.json({ code: 400, success: false, message: "order_image is require", })
            }

        } catch (error) {
            res.json({ code: 400, success: false, message: "Internal server error", })
        }
    }
 
   
}



module.exports = new newsAndBlog();