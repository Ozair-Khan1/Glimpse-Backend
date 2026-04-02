const authController = require('../controllers/auth.controller')
const pfpController = require('../controllers/pfp.controller')
const express = require('express')
const multer = require('multer')

const router = express.Router()

const upload = multer({storage: multer.memoryStorage()})


router.post('/register', authController.register)
router.post('/verify', authController.verifyOtp)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/add-pfp', upload.single('image'), pfpController.addPfp)
router.post('/add-bio', pfpController.addBio)
router.post('/follow/:targetUserId', authController.toggleFollow)
router.get('/get-user', authController.getUser)
router.post('/resend-code', authController.resendCode)
router.get('/get-all-user', authController.getAllUsers)

module.exports = router