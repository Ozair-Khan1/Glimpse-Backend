const ImageKit = require('imagekit')
const storyModel = require('../models/story.model')

const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC,
    privateKey: process.env.IMAGE_KIT_PRIVATE,
    urlEndpoint: process.env.IMAGE_KIT_URL
})

const uploadFile = async ({ buffer, originalname, folder }) => {
    const fileName = originalname || `profile_${Date.now()}.jpg`;
    const result = await imagekit.upload({
        file: buffer,
        fileName: fileName,
        folder: folder
    });

    return result
};

const cleanUpStories = async () => {
    const expirationTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredStories = await storyModel.find({
        createdAt: { $lt: expirationTime }
    })

    if (expiredStories.length > 0) {
        const fileId = expiredStories.map(s => s.imageId)
        console.log("Current Time:", new Date());
        console.log("Checking for stories created before:", expirationTime);

        try {

            await imagekit.bulkDeleteFiles(fileId)

            await storyModel.deleteMany({ _id: { $in: expiredStories.map(s => s._id) } });

            console.log(`✅ Success: Deleted ${expiredStories.length} stories from DB and ImageKit.`)

        } catch (error) {
            console.log('Clean up', error)
        }
    }
}

const deleteImageKitFile = async (fileId) => {
    try {
        await imagekit.deleteFile(fileId);
        return { success: true };
    } catch (error) {
        console.error("ImageKit Delete Error:", error);
        throw error;
    }
};

module.exports = { uploadFile, deleteImageKitFile, cleanUpStories }