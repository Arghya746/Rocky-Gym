const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

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
// ROUTES
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

app.use(
    '/api/trainers',
    trainerRoutes
);


// ===============================
// TEST ROUTE
// ===============================

app.get('/', (req, res) => {

    res.json({
        message: 'Alpha Gym Backend is running!',
    });

});


// ===============================
// SERVER
// ===============================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Alpha Gym Backend running on port ${PORT}`
    );

});