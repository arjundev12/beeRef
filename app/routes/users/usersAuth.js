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
router.post('/referral-submit',validationData.submitReferral, user_controller.submitReferral)
router.get('/team', user_controller.getTeam)
router.get('/wallet', wallet.getWallet)

router.post('/get-news', getNewsAndBlog.getNews)
router.post('/get-blogs', getNewsAndBlog.getBlogs)




router.put('/verify-otp', validationData.verifyOtp, user_controller.verifyOtp);
router.post('/upload-image',upload.single('profile_image'), user_controller.uploadeImage)


module.exports = router;

