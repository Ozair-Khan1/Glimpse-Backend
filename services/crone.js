const cron = require('node-cron')
const ImageKit = require('../services/imageKit.service')

const initCron = () => {

    cron.schedule('0 * * * *', async () => {
        console.log('Checking for expired stories (24 cycle)...')
        await ImageKit.cleanUpStories()
    })

    console.log('Cron jobs initialized with 1 hour intervals.')
}

module.exports = initCron