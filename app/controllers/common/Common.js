

const utilities = require('util');
const config = require('../../../config/config')
const NewsModel = require('../../models/news')
const BlogModel = require('../../models/blogs')
var jwt = require('jsonwebtoken');

class Common {
    constructor() {
        return {
            getBlogs: this.getBlogs.bind(this),
            getNews: this.getNews.bind(this),
        }
    }
    
      async getNews(req, res) {
        try {
            let options = {
                offset: req.body.offset || 0,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                lean: true,
            }
            let query = {}
            let data = await NewsModel.paginate(query, options)
            console.log("news", data)
            res.json({ code: 200, success: true, message: "Get list successfully ", data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }

    async getBlogs(req, res) {
        try {
            let options = {
                offset: req.body.offset || 0,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                lean: true,
            }
            let query = {}
            let data = await BlogModel.paginate(query, options)
            console.log("news", data)
            res.json({ code: 200, success: true, message: "Get list successfully ", data: data })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }

}

module.exports = new Common();
