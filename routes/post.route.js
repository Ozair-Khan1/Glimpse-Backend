const express = require('express')
const multer = require('multer')
const postController = require('../controllers/post.controller')

const router = express.Router()

const upload = multer({storage: multer.memoryStorage()})


router.post('/create-post', upload.single('image'), postController.createPost)
router.get('/posts', postController.getFollowedPosts)
router.post('/like/:postId', postController.toggleLike)
router.post('/comment/:postId', postController.addComment)
router.post('/delete-post/:postId', postController.deletePost)
router.get('/get-posts', postController.getMyPosts)

module.exports = router