const express = require('express')
const storyController = require('../controllers/story.controller')

const router = express.Router()


router.post('/add-story', storyController.addStory)
router.post('/like-story/:storyId', storyController.likeStory)
router.post('/add-comment/:storyId', storyController.addComment)
router.get('/get-comments/:storyId', storyController.getComments)
router.post('/delete-story/:storyId', storyController.deleteStory)
router.get('/get-follower-story', storyController.getFollowedStory)
router.get('/my-story', storyController.isStoryAdded)

module.exports = router