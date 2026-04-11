const connectDB = require('../db/db');

const dbMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection failed in middleware:', error);
        res.status(500).json({ message: 'Database connection failed' });
    }
};

module.exports = dbMiddleware;
