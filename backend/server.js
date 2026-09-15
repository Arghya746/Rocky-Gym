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

app.use(
    '/api/contacts',
    contactRoutes
);

app.use(
    '/api/admin',
    adminRoutes
);

app.use(
    '/api/members',
    memberRoutes
);

app.use(
    '/api/payments',
    paymentRoutes
);

app.use(
    '/api/attendance',
    attendanceRoutes
);

app.use(
    '/api/workouts',
    workoutRoutes
);

app.use(
    '/api/dashboard',
    dashboardRoutes
);

app.use(
    '/api/admin/staff',
    staffRoutes
);


// ===============================
// MEMBERSHIP PLANS
// ===============================

app.use(
    '/api/plans',
    planRoutes
);


// ===============================
// MEMBERSHIP OFFERS
// ===============================

app.use(
    '/api/offers',
    offerRoutes
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