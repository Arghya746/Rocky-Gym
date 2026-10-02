require('dotenv').config();

const connectDB = require('./config/db');
const mongoose = require('mongoose');
const AccessPass = require('./models/AccessPass');

/* =========================================================
   ACCESS PASS DATA
   ========================================================= */

const BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const ACCESS_PASSES = [{
        passType: 'Daily Access',
        price: 200,
        durationDays: 1,
        description: 'Perfect for those who want to stay active with flexible short term access',
    },
    {
        passType: 'Weekly Access',
        price: 800,
        durationDays: 7,
        description: 'Stay consistent with 7 days of full access to all gym facilities',
    },
];

/* =========================================================
   SEED FUNCTION
   ========================================================= */

const seedAccessPasses = async() => {
    try {
        /* -------------------------------------------------
           CONNECT USING THE SAME DATABASE CONFIG AS SERVER
        ------------------------------------------------- */

        console.log('Connecting to MongoDB...');

        await connectDB();

        console.log('MongoDB connected.');
        console.log(
            `Database: ${mongoose.connection.name}`
        );

        /* -------------------------------------------------
           REMOVE OLD ACCESS PASS RECORDS
        ------------------------------------------------- */

        console.log('');
        console.log('Removing existing access pass records...');

        const deleted = await AccessPass.deleteMany({});

        console.log(
            `Removed ${deleted.deletedCount} existing access pass record(s).`
        );

        /* -------------------------------------------------
           CREATE DAILY + WEEKLY FOR BOTH BRANCHES
        ------------------------------------------------- */

        const createdPasses = [];

        for (const gymBranch of BRANCHES) {

            for (const passData of ACCESS_PASSES) {

                const pass = await AccessPass.create({
                    gymBranch,
                    passType: passData.passType,
                    price: passData.price,
                    durationDays: passData.durationDays,
                    description: passData.description,
                    isActive: true,
                });

                createdPasses.push(pass);

                console.log(
                    `Created: ${gymBranch} | ${pass.passType} | ₹${pass.price} | ${pass.durationDays} day(s)`
                );
            }
        }

        /* -------------------------------------------------
           SUMMARY
        ------------------------------------------------- */

        console.log('');
        console.log('==========================================');
        console.log('ACCESS PASS SEED COMPLETED');
        console.log('==========================================');

        console.log(
            `TOTAL ACCESS PASSES: ${createdPasses.length}`
        );

        console.log('');

        createdPasses.forEach((pass) => {
            console.log(
                `${pass.gymBranch} | ${pass.passType} | ₹${pass.price} | ${pass.durationDays} day(s)`
            );
        });

        console.log('');
        console.log('Expected total: 4');
        console.log('Kalyanpur: Daily + Weekly');
        console.log('Gopalpur: Daily + Weekly');
        console.log('==========================================');

    } catch (error) {

        console.error('');
        console.error('==========================================');
        console.error('ACCESS PASS SEED ERROR');
        console.error('==========================================');
        console.error(error);
        console.error('');

        process.exitCode = 1;

    } finally {

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
        }
    }
};

/* =========================================================
   RUN
   ========================================================= */

seedAccessPasses();