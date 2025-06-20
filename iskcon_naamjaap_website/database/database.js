const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/iskcon');
         console.log('MongoDB connected with Mongoose');
    } catch (err) {
            console.log('MongoDB Not connected');
    }
}

module.exports = connectDB;