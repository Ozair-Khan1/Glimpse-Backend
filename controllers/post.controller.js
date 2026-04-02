const postModel = require('../models/post.model')
const imagekit = require('../services/imageKit.service')
const jwt = require('jsonwebtoken')
const userModel = require('../models/auth.model')


const createPost = async (req, res) => {

    const session = req.cookies.session

    if(!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {
        const {caption} = req.body

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const uploadImage = await imagekit.uploadFile({
            buffer: req.file.buffer,
            folder: 'post_images'
        })

        const newPost = await postModel.create({
            author: userId,
            caption: caption,
            imageUrl: uploadImage.url,
            imageId: uploadImage.fileId
        })

        const populatePost = await newPost.populate('author', 'username, profilePicture');

        await userModel.findByIdAndUpdate(userId, {
            posts: newPost._id
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

    const {postId} = req.params

    const session = req.cookies.session

    if(!session) {
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

        // 2. Security Check: Only the author can delete their post
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        // 3. Delete image from ImageKit
        if (post.imageId) {
            await imagekit.deleteImageKitFile(post.imageId);
            console.log("Deleted image from ImageKit:", post.imageId);
        }

        // 4. Delete document from MongoDB
        await postModel.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" })
    } catch (error) {
        console.log(error)
    }

}


const toggleLike = async (req, res) => {

    const {postId} = req.params

    const session = req.cookies.session

    if(!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {

        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const userId = decoded.id

        const post = await postModel.findById(postId)

        if(!post) {
            return res.status(404).json({
                message: 'Post not found'
            })
        }

        const isLiked = post.likes.includes(userId)

        if(isLiked) {
            const updatedPost = await postModel.findByIdAndUpdate(postId, {
                $pull: {likes: userId}
            }, {new: true})
            .populate('author', 'username profilePicture')

            return res.status(200).json({updatedPost})
        }

        const updatedPost = await postModel.findByIdAndUpdate(postId, {
            $addToSet: {likes: userId}
        }, {new: true})
        .populate('author', 'username profilePicture')

        res.status(201).json({updatedPost})
    } catch (error) {
        console.log(error)
    }

}


const addComment = async (req, res) => {

    const {postId} = req.params

    const {text} = req.body

    const session = req.cookies.session

    if(!session) {
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

        await postModel.findByIdAndUpdate(postId, {
            $push: {comments: comment},
            new: true
        }).populate('comments.user', 'username profilePicture')

        res.status(201).json({
            message: 'Comment added'
        })

    } catch (error) {
        console.log(error)
    }
}


const getFollowedPosts = async (req, res) => {


    const session = req.cookies.session

    if(!session) {
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
        .sort({createdAt: -1})

        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
    }
}

const getMyPosts = async (req, res) => {

    const session = req.cookies.session

    if(!session) {
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
        .sort({createdAt: -1})

        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
    }

}

module.exports = {createPost, toggleLike, addComment, getFollowedPosts, deletePost, getMyPosts}