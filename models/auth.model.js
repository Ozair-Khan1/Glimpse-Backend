const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        unique: true,
        toLowerCase: true,
        trim: true,
        required: true,
        validate: {
        validator: function(v) {
            return /^\S+$/.test(v);
        },
  }
    },

    bio: {
        type: String,
        default: ''
    },

    profilePicture: {
        type: String,
        default: 'https://ik.imagekit.io/glimpse/avatar.png'
    },

    profilePictureId: {
        type: String
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    following:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],

    stories: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    },

    storiesImg: {
        type: String
    }
}, {
    timestamps: true
});

const userModel = mongoose.model('User', userSchema)

module.exports = userModel