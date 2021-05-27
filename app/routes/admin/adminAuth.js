const express = require('express');
const router = express.Router();

let uploadFile = require('../../middlewares/fileUploadHelper');
let upload=uploadFile.uploadFileMethod('ProfileImage');
// create login routes
let admin_controller = require('../../controllers/admin/admin');
let wallet = require('../../controllers/users/wallet')
let validationData= require('../../middlewares/FrontendValidator');
// upload.single('profile_image')
router.post('/login',validationData.login, admin_controller.loginAdmin)
router.post('/get-user', admin_controller.getUser)
router.post('/get-transaction', admin_controller.getTransaction)


module.exports = router;

