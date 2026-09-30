const express = require('express');
const cors = require('cors');

require('dotenv').config();

/* =========================================================
   DATABASE
   ========================================================= */

const connectDB = require('./config/db');


/* =========================================================
   ROUTES
   ========================================================= */

const contactRoutes =
    require('./routes/contactRoutes');

const adminRoutes =
    require('./routes/adminRoutes');

const memberRoutes =
    require('./routes/memberRoutes');

const paymentRoutes =
    require('./routes/paymentRoutes');

const attendanceRoutes =
    require('./routes/attendanceRoutes');

const workoutRoutes =
    require('./routes/workoutRoutes');

const dashboardRoutes =
    require('./routes/dashboardRoutes');

const staffRoutes =
    require('./routes/staffRoutes');

const offerRoutes =
    require('./routes/offerRoutes');

const trainerRoutes =
    require('./routes/trainerRoutes');

const accessPassRoutes =
    require('./routes/accessPassRoutes');


/* =========================================================
   APP
   ========================================================= */

const app =
    express();


/* =========================================================
   BASIC CONFIGURATION
   ========================================================= */

app.disable(
    'x-powered-by'
);


/* =========================================================
   CORS
   ========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);


/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true,
    })
);


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
    '/',
    (req, res) => {

        return res.json({
            message: 'Alpha Gym Backend is running!',

            status: 'success',
        });
    }
);


/* =========================================================
   API ROUTES
   ========================================================= */


/* ---------------------------------------------------------
   CONTACTS / ENQUIRIES
--------------------------------------------------------- */

app.use(
    '/api/contacts',
    contactRoutes
);


/* ---------------------------------------------------------
   ADMIN
--------------------------------------------------------- */

app.use(
    '/api/admin',
    adminRoutes
);


/* ---------------------------------------------------------
   MEMBERS
--------------------------------------------------------- */

app.use(
    '/api/members',
    memberRoutes
);


/* ---------------------------------------------------------
   PAYMENTS
--------------------------------------------------------- */

app.use(
    '/api/payments',
    paymentRoutes
);


/* ---------------------------------------------------------
   ATTENDANCE
--------------------------------------------------------- */

app.use(
    '/api/attendance',
    attendanceRoutes
);


/* ---------------------------------------------------------
   WORKOUTS
--------------------------------------------------------- */

app.use(
    '/api/workouts',
    workoutRoutes
);


/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */

app.use(
    '/api/dashboard',
    dashboardRoutes
);


/* ---------------------------------------------------------
   STAFF MANAGEMENT
--------------------------------------------------------- */

app.use(
    '/api/admin/staff',
    staffRoutes
);


/* ---------------------------------------------------------
   PUJA OFFERS
--------------------------------------------------------- */

app.use(
    '/api/offers',
    offerRoutes
);


/* ---------------------------------------------------------
   ACCESS PASSES
   DAILY ACCESS / WEEKLY ACCESS
--------------------------------------------------------- */

app.use(
    '/api/access-passes',
    accessPassRoutes
);


/* ---------------------------------------------------------
   TRAINERS
--------------------------------------------------------- */

app.use(
    '/api/trainers',
    trainerRoutes
);


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use(
    (req, res) => {

        return res
            .status(404)
            .json({
                success: false,

                message: `API route not found: ${req.method} ${req.originalUrl}`,
            });
    }
);


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            'SERVER ERROR:',
            error
        );

        if (
            res.headersSent
        ) {

            return next(error);
        }

        return res
            .status(
                error.status || 500
            )
            .json({

                success: false,

                message: error.message ||
                    'Internal server error.',
            });
    }
);


/* =========================================================
   PORT
   ========================================================= */

const PORT =
    Number(
        process.env.PORT
    ) || 5000;


/* =========================================================
   START SERVER
   ========================================================= */

const startServer = async() => {

    try {

        /* -------------------------------------------------
           DATABASE FIRST
        ------------------------------------------------- */

        await connectDB();


        /* -------------------------------------------------
           START HTTP SERVER
        ------------------------------------------------- */

        app.listen(
            PORT,
            () => {

                console.log(
                    `Alpha Gym Backend running on port ${PORT}`
                );

                console.log(
                    `API Base URL: http://localhost:${PORT}`
                );
            }
        );

    } catch (error) {

        console.error(
            'SERVER STARTUP FAILED:',
            error.message
        );

        process.exit(1);
    }
};


/* =========================================================
   START
   ========================================================= */

startServer();