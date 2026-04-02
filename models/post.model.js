const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    imageUrl: {
        type: String,
        required: true
    },

    imageId: {
        type: String,
        required: true
    },

    caption: {
        type: String,
        trim: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [{
        user: {type: mongoose.Schema.Types.ObjectId},
        text: {type: String, required: true},
        createdAt: {type: Date, default: Date.now}
    }]

}, {
    timestamps: true
})

const postModel = mongoose.model('Post', postSchema)

module.exports = postModel