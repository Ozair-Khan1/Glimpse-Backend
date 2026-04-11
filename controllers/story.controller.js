const jwt = require('jsonwebtoken')
const storyModel = require('../models/story.model')
const { del } = require('@vercel/blob')
const userModel = require('../models/auth.model')
const connectDB = require('../db/db')


const addStory = async (req, res) => {

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {
        const { imageUrl } = req.body

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if (user.storiesImg) {
            try {

                await del(user.storiesImg)

                console.log('story image deleted')

            } catch (error) {
                console.log('Blob', error)
            }
        }

        await storyModel.findByIdAndDelete(user.stories)

        const story = await storyModel.create({
            author: decoded.id,
            imageUrl: imageUrl,
            imageId: imageUrl
        })

        user.storiesImg = imageUrl

        user.stories = story._id

        await user.save()

        const populateStory = await story.populate('author', 'username profilePicture')

        res.status(201).json({
            message: 'Story created',
            story: populateStory
        })
    } catch (error) {
        console.log(error)
    }
}

const likeStory = async (req, res) => {

    const { storyId } = req.params
    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const story = await storyModel.findById(storyId)

        if (!story) {
            return res.status(404).json({
                message: 'Story not found'
            })
        }

        const isLiked = story.likes.includes(userId)

        if (isLiked) {

            const updatedStory = await storyModel.findByIdAndUpdate(storyId, {
                $pull: { likes: userId }
            }, { returnDocument: 'after' })
                .populate('author', 'username profilePicture')

            return res.status(200).json({
                message: 'Story unliked',
                updatedStory
            })
        }

        const updatedStory = await storyModel.findByIdAndUpdate(storyId, {
            $addToSet: { likes: userId }
        }, { returnDocument: 'after' })
            .populate('author', 'username profilePicture')

        res.status(200).json({
            message: 'Story liked',
            updatedStory
        })
    } catch (error) {
        console.log(error)
    }

}

const addComment = async (req, res) => {

    const { storyId } = req.params
    const { text } = req.body
    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const comment = {
            user: userId,
            text: text,
            createdAt: new Date()
        }

        const updatedComments = await storyModel.findByIdAndUpdate(storyId, {
            $push: { comments: comment }
        }, { returnDocument: 'after' })
            .populate('comments.user', 'username profilePicture')

        res.status(201).json({
            message: 'Comment added',
            comments: updatedComments
        })

    } catch (error) {
        console.log(error)
    }

}

const getComments = async (req, res) => {

    try {
        const { storyId } = req.params;

        const story = await storyModel.findById(storyId)
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username profilePicture _id' }
            });

        if (!story) return res.status(404).json({ message: 'Story not found' });

        res.status(200).json(story.comments.reverse());
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}


const deleteStory = async (req, res) => {

    const { storyId } = req.params

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {
        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const story = await storyModel.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "story not found" });
        }

        if (story.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this story" });
        }

        if (story.imageUrl) {
            try {
                await del(story.imageUrl);
                console.log("Deleted media from Vercel Blob:", story.imageUrl);
            } catch (err) {
                console.error("Vercel Blob Delete Error:", err);
            }
        }

        await storyModel.findByIdAndDelete(storyId);

        const user = await userModel.findById(userId)

        user.stories = null
        user.storiesImg = null

        await user.save()

        res.status(200).json({ message: "story deleted successfully" })
    } catch (error) {
        console.log(error)
    }

}

const getFollowedStory = async (req, res) => {


    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const myId = decoded.id
        const me = await userModel.findById(myId)

        const story = await storyModel.find({
            author: { $in: [...me.following, myId] }
        })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })

        const myStory = story.filter(s => s.author._id.toString() === myId)
        const otherStories = story.filter(s => s.author._id.toString() !== myId)

        const sortedStories = [...myStory, ...otherStories]

        res.status(200).json(sortedStories)
    } catch (error) {
        console.log(error)
    }
}

const isStoryAdded = async (req, res) => {

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const myId = decoded.id

        const story = await storyModel.find({ author: { $in: myId } }).select('author -_id')

        if (!story) {
            return res.status(404).json({
                message: 'Not found'
            })
        }

        res.status(200).json(story)

    } catch (error) {
        console.log(error)
    }

}

const storyCleanup = async (req, res) => {

    await connectDB()

    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const expirationTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredStories = await storyModel.find({
        createdAt: { $lt: expirationTime }
    })

    if (expiredStories.length > 0) {
        const fileId = expiredStories.map(s => s.imageUrl)
        console.log("Current Time:", new Date());
        console.log("Checking for stories created before:", expirationTime);

        try {

            await del(fileId)

            await storyModel.deleteMany({ _id: { $in: expiredStories.map(s => s._id) } });

            console.log(`Success: Deleted ${expiredStories.length} stories from DB and ImageKit.`)

        } catch (error) {
            console.log('Clean up', error)
        }
    }
}


module.exports = { addStory, likeStory, addComment, getComments, deleteStory, getFollowedStory, isStoryAdded, storyCleanup }