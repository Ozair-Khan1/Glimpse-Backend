const userModel = require('../models/auth.model')
const imageKitService = require('../services/imageKit.service')
const jwt = require('jsonwebtoken')

const addPfp = async (req, res) => {

    try {

        const session = req.cookies.session

        if (!req.file) {
            return res.status(404).json({
                message: 'File not found'
            })
        } else if (!session) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const result = await imageKitService.uploadFile({
            buffer: req.file.buffer,
            folder: 'profile_pictures'
        })

        console.log(result)

        let decoded;

        try {
            decoded = await jwt.verify(session, process.env.JWT_SECRET)
        } catch (error) {
            console.log('decodding error', error)
        }

        const user = await userModel.findById(decoded.id)

        if(!user) {
            return res.status(404).json({
                messager: 'User not found'
            })
        }

        user.profilePicture = result.url;

        const updatedUser = await user.save()

        console.log(updatedUser)

        res.status(201).json({
            message: 'Pfp added'
        })
    } catch (error) {
        console.log(error)
    }

}

const addBio = async (req, res) => {

    const {bio} = req.body
    
    const session = req.cookies.session

    try {
        
        let decodded;

        try {
            decodded = jwt.verify(session, process.env.JWT_SECRET)
        } catch (error) {
            console.log('decodding error', error)
        }

        const findUser = await userModel.findByIdAndUpdate(decodded.id, {
            bio: bio
        }, {new: true})

        await findUser.save()

        res.status(201).json({
            message: 'Bio added'
        })

    } catch (error) {
        console.log(error)
    }

}

module.exports = {addPfp, addBio}