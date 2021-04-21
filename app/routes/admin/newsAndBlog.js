const express = require('express');
const router = express.Router();

let uploadFile = require('../../middlewares/fileUploadHelper');
let upload=uploadFile.uploadFileMethod('ProfileImage');
// create login routes
let getNewsAndBlog = require('../../controllers/common/Common');
let createNewsAndBlog = require('../../controllers/admin/newsAndBlog');
let validationData= require('../../middlewares/FrontendValidator');
// upload.single('profile_image')
router.post('/news',createNewsAndBlog.createNews)
router.post('/blogs',createNewsAndBlog.createBlogs)

router.post('/get-news', getNewsAndBlog.getNews)
router.post('/get-blogs', getNewsAndBlog.getBlogs)


module.exports = router;

