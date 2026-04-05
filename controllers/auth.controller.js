const userModel = require('../models/auth.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../services/email.service')
const otpModel = require('../models/otp.model')
const otpBody = require('../utils/util')


const register = async (req, res) => {
    const {email, name, username, password} = req.body

    const userExists = await userModel.findOne({
        $or: [{email}, {username}]
    })

    if(userExists) {

        if(userExists.email === email) {
        return res.status(409).json({
            message: 'Email Exists'
        })
        } 
        
        if(userExists.username === username) {
            return res.status(409).json({
                message: 'Username Exists'
            })
        }

    }


    const hashPass = await bcrypt.hash(password, 10)

    const otp = otpBody.generateOtp()
    const html = otpBody.getOtpHtml(otp)

    const otpHash = await bcrypt.hash(otp, 10)

    await otpModel.create({
        email,
        name,
        username,
        password: hashPass,
        otpHash
    })

    const verifyToken = jwt.sign({
        email: email
    }, process.env.JWT_SECRET)

    res.cookie('verifyToken', verifyToken, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    await sendEmail(email, 'OTP Verification', `Your OTP code is ${otp}`, html)

    res.status(201).json({
        message: 'Otp Sent Successfully',
    })

}

const login = async (req, res) => {
    const {identifier, password} = req.body

    const userExists = await userModel.findOne({
        $or: [
            {email: identifier},
            {username: identifier}
        ]
    });

    if(!userExists) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const matchPass = await bcrypt.compare(password, userExists.password)

    if(!matchPass) {
        return res.status(403).json({
            message: 'Incorrect password'
        })
    }

    const session = jwt.sign({
        id: userExists._id
    }, process.env.JWT_SECRET)

    res.cookie('session', session, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: 'logged in',
        user: {
            email: userExists.email,
            username: userExists.username
        }
    })
}

const logout = async (req, res) => {
    const token = req.cookies.session

    if(!token) {
        return res.status(404).json({
            message: 'Token not found'
        })
    }

    res.clearCookie('session', {
        httpOnly: true,
        secure: true,     
        sameSite: 'none', 
    })

    res.status(200).json({
        message: 'Logged out'
    })
}

const toggleFollow = async (req, res) => {

    const {targetUserId} = req.params

   const session = req.cookies.session

    if(!session) {
        return res.status(404).json({
            message: 'Token not found'
        })
    }

    let decoded;

    try {
        
        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const myId = decoded.id

        if(myId === targetUserId) {
            return res.status(400).json({
                message: 'Cannot follow yourself'
            })
        }

        const targerUser = await userModel.findById(targetUserId)

        const me = await userModel.findById(myId)

        if(!me || !targerUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const isFollowing = me.following.includes(targetUserId);

        if(isFollowing) {

            await userModel.findByIdAndUpdate(myId, {$pull: {following: targetUserId}});

            const user = await userModel.findByIdAndUpdate(targetUserId, {$pull: {followers: myId}}, {returnDocument: 'after'}).select('followers -_id')

            return res.status(200).json({
                message: 'Unfollowed successfully',
                user
            })

        }

        await userModel.findByIdAndUpdate(myId, {$addToSet: {following: targetUserId}})

        const user = await userModel.findByIdAndUpdate(targetUserId, {$addToSet: {followers: myId}}, {returnDocument: 'after'}).select('followers -_id')

        res.status(201).json({
            message: 'Followed successfully',
            user
        })

    } catch (error) {
        console.log(error)
    }

}

const getUser = async (req, res) => {

    const session = req.cookies.session

    if(!session) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    let decoded;

    try {
        
        decoded = jwt.verify(session, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        res.status(200).json({
            message: 'User found',
            user: user._id,
            username: user.username,
            pfp: user.profilePicture,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length
        })

    } catch (error) {
        
    }

}

const resendCode = async (req, res) => {

    const token = req.cookies.verifyToken

    if(!token) {
        return res.status(404).json({
            message: 'Token not found'
        })
    }

    let decoded;

    try {
        
        decoded = jwt.verify(token, process.env.JWT_SECRET)

        const email = decoded.email

        const otp = otpBody.generateOtp()
        const html = otpBody.getOtpHtml(otp)

        const otpHash = await bcrypt.hash(otp, 10)

        const updatePrevOtp = await otpModel.findOne({email: email})

        updatePrevOtp.otpHash = otpHash

        await updatePrevOtp.save()

        await sendEmail(email, 'OTP Verification', `Your OTP code is ${otp}`, html)
        
        res.status(200).json({
            message: 'Resend successfully'
        })
    } catch (error) {
        console.log(error)
    }

} 

const getAllUsers = async (req, res) => {

    const token = req.cookies.session

    if(!token) {
         return res.status(401).json({
            message: 'Token not found'
         })
    }

    let decoded;

    try {
        
        decoded = jwt.verify(token, process.env.JWT_SECRET)

        const currentUser = await userModel.findById(decoded.id)
        
        const users = await userModel.find({
            $and: [
                { _id: { $ne: decoded.id } },
                { _id: { $nin: currentUser.following } }
            ]
        })

        res.status(200).json({
            message: 'All users fetched',
            users
        })

    } catch (error) {
        console.log(error)
    }

}

const getClickedUser = async (req, res) => {

    const {id} = req.params

     const token = req.cookies.session

    if(!token) {
         return res.status(401).json({
            message: 'Token not found'
         })
    }

    try {
        
        const user = await userModel.findById(id).select('-email -password')

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            username: user.username,
            pfp: user.profilePicture,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length,
            posts: user.posts.length
        })

    } catch (error) {
        console.log(error)
    }

}

const getFollowers = async (req, res) => {

    const {id} = req.params

    const token = req.cookies.session

    if(!token) {
         return res.status(401).json({
            message: 'Token not found'
         })
    }

    try {
        
        const user = await userModel.findById(id).select('followers -_id')

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            message: 'Followers',
            user
        })

    } catch (error) {
        console.log(error)   
    }

}

const verifyOtp = async (req, res) => {
    try {
        const token = req.cookies.verifyToken

        if(!token) {
            return res.status(401).json({
                message: 'Token not found'
            })
        }

        let decoded;

        try {

            decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        } catch (error) {
            return res.status(402).json({
                message: 'Invalid Code'
            })
        }

        const userEmail = decoded.email

        const {otp} = req.body

        const otpRecord = await otpModel.findOne({email: userEmail})

        if(!otpRecord) {
            return res.status(404).json({
                message: 'Otp expired or not found'
            })
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otpHash)

        if(!isMatch) {
            return res.status(406).json({
                message: 'Invalid code'
            })
        }

        const newUser = await userModel.create({
            name: otpRecord.name,
            email: otpRecord.email,
            username: otpRecord.username,
            password: otpRecord.password,
            isVerified: true
        })

        console.log(newUser)

        await otpModel.deleteOne({_id: otpRecord._id})

        res.clearCookie('verifyToken', {
            httpOnly: true,
            secure: true,     
            sameSite: 'none', 
        })

        const session = jwt.sign({
            id: newUser._id
        }, process.env.JWT_SECRET)

        res.cookie('session', session, {
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: 'Account created',
            user: {
                username: newUser.username,
                email: newUser.email
            }
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {register, verifyOtp, login, logout, toggleFollow, getUser, resendCode, getAllUsers, getClickedUser, getFollowers}