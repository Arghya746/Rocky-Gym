const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = require('./config/db');

// ===============================
// ROUTES
// ===============================

const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const memberRoutes = require('./routes/memberRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const staffRoutes = require('./routes/staffRoutes');
const planRoutes = require('./routes/planRoutes');
const offerRoutes = require('./routes/offerRoutes');
const trainerRoutes = require('./routes/trainerRoutes');


// ===============================
// APP INITIALIZATION
// ===============================

const app = express();


// ===============================
// DATABASE
// ===============================

connectDB();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// API ROUTES
// ===============================

// Contact / Enquiries
app.use(
    '/api/contacts',
    contactRoutes
);


// Admin
app.use(
    '/api/admin',
    adminRoutes
);


// Members
app.use(
    '/api/members',
    memberRoutes
);


// Payments
app.use(
    '/api/payments',
    paymentRoutes
);


// Attendance
app.use(
    '/api/attendance',
    attendanceRoutes
);


// Workouts
app.use(
    '/api/workouts',
    workoutRoutes
);


// Dashboard
app.use(
    '/api/dashboard',
    dashboardRoutes
);


// Staff Management
app.use(
    '/api/admin/staff',
    staffRoutes
);


// Membership Plans
app.use(
    '/api/plans',
    planRoutes
);


// Membership Offers
app.use(
    '/api/offers',
    offerRoutes
);


// Trainers
app.use(
    '/api/trainers',
    trainerRoutes
);


// ===============================
// TEMPORARY MONGODB DIAGNOSTIC
// REMOVE AFTER TESTING
// ===============================

app.get('/api/debug/mongo-target', (req, res) => {
    try {
        const mongoHost = mongoose.connection.host || '';
        const mongoDatabase = mongoose.connection.name || '';

        const fingerprintSource =
            `${mongoHost}/${mongoDatabase}`;

        const fingerprint = crypto
            .createHash('sha256')
            .update(fingerprintSource)
            .digest('hex');

        return res.json({
            connected: mongoose.connection.readyState === 1,
            mongoHost,
            mongoDatabase,
            fingerprint,
        });
    } catch (error) {
        console.error(
            'MongoDB diagnostic error:',
            error.message
        );

        return res.status(500).json({
            connected: false,
            error: 'Unable to read MongoDB connection information.',
        });
    }
});


// ===============================
// HEALTH CHECK
// ===============================

app.get('/', (req, res) => {
    return res.json({
        message: 'Alpha Gym Backend is running!',
        status: 'success',
    });
});


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Alpha Gym Backend running on port ${PORT}`
    );
});