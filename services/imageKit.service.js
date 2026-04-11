const ImageKit = require('imagekit')
const storyModel = require('../models/story.model')
const { del } = require('@vercel/blob')

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