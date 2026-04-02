const ImageKit = require('imagekit')

const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC,
    privateKey: process.env.IMAGE_KIT_PRIVATE,
    urlEndpoint: process.env.IMAGE_KIT_URL
})

const uploadFile = async ({buffer, folder}) => {
    const result = await imagekit.upload({
        file: buffer.toString('base64'),
        fileName: `profile_${Date.now()}.jpg`,
        folder: folder
    });

    return result
};

const deleteImageKitFile = async (fileId) => {
    try {
        await imagekit.deleteFile(fileId);
        return { success: true };
    } catch (error) {
        console.error("ImageKit Delete Error:", error);
        throw error;
    }
};

module.exports = {uploadFile, deleteImageKitFile}