const postModel = require('../models/post.model')
const { del } = require('@vercel/blob')
const jwt = require('jsonwebtoken')
const userModel = require('../models/auth.model')

const createPost = async (req, res) => {

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {
        const { caption, imageUrl } = req.body

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const newPost = await postModel.create({
            author: userId,
            caption: caption,
            imageUrl: imageUrl,
            imageId: imageUrl // We use the url for Vercel Blob deletion
        })

        const populatePost = await newPost.populate('author', 'username, profilePicture');

        await userModel.findByIdAndUpdate(userId, {
            $addToSet: { posts: newPost._id }
        })

        res.status(201).json({
            message: 'Post created',
            post: populatePost
        })

    } catch (error) {
        console.log(error)
    }
}

const deletePost = async (req, res) => {

    const { postId } = req.params

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

        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        if (post.imageUrl) {
            try {
                await del(post.imageUrl);
                console.log("Deleted media from Vercel Blob:", post.imageUrl);
            } catch (err) {
                console.error("Vercel Blob Delete Error:", err);
            }
        }

        await postModel.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" })
    } catch (error) {
        console.log(error)
    }

}


const toggleLike = async (req, res) => {

    const { postId } = req.params

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

        const post = await postModel.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const isLiked = post.likes.includes(userId)

        if (isLiked) {
            const updatedPost = await postModel.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            }, { returnDocument: 'after' })
                .populate('author', 'username profilePicture')

            return res.status(200).json({ updatedPost })
        }

        const updatedPost = await postModel.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId }
        }, { returnDocument: 'after' })
            .populate('author', 'username profilePicture')

        res.status(201).json({ updatedPost })
    } catch (error) {
        console.log(error)
    }

}


const addComment = async (req, res) => {

    const { postId } = req.params

    const { text } = req.body

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    } else if (!text) {
        return res.status(404).json({
            message: 'Text is required'
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
        };

        const updatedComments = await postModel.findByIdAndUpdate(
            postId,
            { $push: { comments: comment } },
            { returnDocument: 'after' }
        ).populate('comments.user', 'username profilePicture');

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
        const { postId } = req.params;

        const post = await postModel.findById(postId)
            .populate({
                path: 'comments',
                populate: { path: 'user', select: 'username profilePicture _id' }
            });

        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.status(200).json(post.comments.reverse());
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

const gerProfilePostComment = async (req, res) => {

    try {
        const { postId } = req.params;

        const post = await postModel.findById(postId).populate({
            path: 'comments',
            populate: { path: 'user', select: 'username profilePicture' }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found', success: false });
        }

        res.status(200).json(post.comments.reverse());
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

}


const getFollowedPosts = async (req, res) => {


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

        const posts = await postModel.find({
            author: { $in: [...me.following, myId] }
        })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })

        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
    }
}

const getMyPosts = async (req, res) => {

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

        const posts = await postModel.find({
            author: me._id
        })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })

        res.status(200).json({
            posts: posts,
            postLength: posts.length
        })
    } catch (error) {
        console.log(error)
    }

}

const getPostById = async (req, res) => {

    const { id } = req.params

    const session = req.cookies.session

    if (!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    try {

        const post = await postModel.find({ author: id })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })

        res.status(200).json(post)

    } catch (error) {
        console.log(error)
    }

}

module.exports = { createPost, toggleLike, addComment, getFollowedPosts, deletePost, getMyPosts, getComments, gerProfilePostComment, getPostById }