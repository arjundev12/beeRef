const express = require('express');
const router = express.Router();

const uploadFile = require('../../middlewares/fileUploadHelper');
const upload=uploadFile.uploadFileMethod('NewsAndBlogs');
// create login routes
let getNewsAndBlog = require('../../controllers/common/Common');
let managePrice = require('../../controllers/admin/managePrice');
let validationData= require('../../middlewares/FrontendValidator');
// upload.single('profile_image')
router.post('/add-price',managePrice.create)
router.put('/update-price',managePrice.update)
router.get('/get-price',managePrice.getData)
router.get('/view-price',managePrice.viewData)

module.exports = router;

