const express = require('express');
const router = express.Router();

const uploadFile = require('../../middlewares/fileUploadHelper');
const upload=uploadFile.uploadFileMethod('ProfileImage');
// create login routes
const user_controller = require('../../controllers/users/userAuth');
const getNewsAndBlog = require('../../controllers/common/Common')
const wallet = require('../../controllers/users/wallet')

const validationData= require('../../middlewares/FrontendValidator');

router.post('/sign-up',validationData.signUp,  user_controller.signUp);
router.post('/login',validationData.login, user_controller.login)
router.post('/update-profile',validationData.update, user_controller.UpdateProfile)
router.get('/team', user_controller.getTeam)
router.get('/user-details', user_controller.getUserDetails)
router.get('/wallet', wallet.getWallet)

router.get('/dashboard', user_controller.getDashboard)

router.post('/get-news', getNewsAndBlog.getNews)
router.post('/get-blogs', getNewsAndBlog.getBlogs)


router.put('/verify-otp', validationData.verifyOtp, user_controller.verifyOtp);
router.post('/upload-image', user_controller.uploadeImage)
router.post('/forgot', user_controller.forgotPassword)
router.post('/verify-email', validationData.verifyforgot,user_controller.verifyForgot)
router.post('/set-password', validationData.setForgotPass,user_controller.setForgotPass)
router.post('/referral-submit',validationData.submitReferral, user_controller.submitReferral)
router.put('/minner-update',user_controller.minnerActivity)

router.post('/check-username',validationData.chekUserName, user_controller.chekUserName)
router.post('/check-reddit-username',validationData.chekRedditUserName, user_controller.chekRedditUserName)
router.post('/reset-password',validationData.resetPassword, user_controller.resetPassword)








module.exports = router;

