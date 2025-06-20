const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI); // no options needed in Mongoose 8+
        console.log('MongoDB connected with Mongoose');
    } catch (err) {
        console.error('MongoDB Not connected', err);
    }
}

module.exports = connectDB;
