const express = require('express');
const router = express.Router();

let uploadFile = require('../../middlewares/fileUploadHelper');
let upload=uploadFile.uploadFileMethod('ProfileImage');
// create login routes
let user_controller = require('../../controllers/users/userAuth');
let wallet = require('../../controllers/users/wallet')
let validationData= require('../../middlewares/FrontendValidator');
// let api_Auth = require('../../middlewares/apiTokenAuth')
// upload.single('profile_image')
router.post('/sign-up',validationData.signUp,  user_controller.signUp);
router.post('/login',validationData.login, user_controller.login)
router.post('/update-profile',validationData.update, user_controller.UpdateProfile)
router.post('/referral-submit',validationData.submitReferral, user_controller.submitReferral)
router.get('/team', user_controller.getTeam)
router.get('/wallet', wallet.getWallet)




router.put('/verify-otp', validationData.verifyOtp, user_controller.verifyOtp);
router.post('/upload-image',upload.single('profile_image'), user_controller.uploadeImage)


module.exports = router;

