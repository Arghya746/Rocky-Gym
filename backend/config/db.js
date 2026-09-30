const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        /* -------------------------------------------------
           ENV VALIDATION
        ------------------------------------------------- */

        if (!process.env.MONGO_URI) {
            throw new Error(
                'MONGO_URI is missing. Check backend/.env'
            );
        }

        /* -------------------------------------------------
           CONNECT TO MONGODB
        ------------------------------------------------- */

        const conn = await mongoose.connect(
            process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
            }
        );

        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        console.log(
            `MongoDB Connected: ${conn.connection.host}`
        );

        console.log(
            `MongoDB Database: ${conn.connection.name}`
        );

        return conn;

    } catch (error) {
        /* -------------------------------------------------
           CONNECTION ERROR
        ------------------------------------------------- */

        console.error(
            'MongoDB Connection Error:',
            error.message
        );

        throw error;
    }
};

module.exports = connectDB;