const imageKit = require('./imageKit.service')
const cronJob = require('node-cron')

const croneJob = () => {
    cronJob.schedule('0 * * * *', async () => {
        console.log('Running Hourly Story Cleanup');

        try {
            await imageKit.cleanUpStories()

            console.log('Story Cleanup completed successfully');
        } catch (error) {
            console.log('Error in cleanup', error)
        }
    })
}

module.exports = croneJob