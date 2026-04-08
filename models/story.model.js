const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({

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

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        text: {type: String, required: true},
        createdAt: {type: Date, default: Date.now}
     }]

}, {
    timestamps: true
});

const storyModel = mongoose.model('Story', storySchema)

module.exports = storyModel