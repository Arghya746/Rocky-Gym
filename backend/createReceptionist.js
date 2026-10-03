require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createOrUpdateReceptionist() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected');

        const email = 'reception@alphagym.com';
        const password = 'Reception@123';

        // =====================================================
        // FIND EXISTING RECEPTIONIST
        // =====================================================

        let receptionist = await Admin.findOne({ email });

        // =====================================================
        // IF RECEPTIONIST ALREADY EXISTS
        // UPDATE BRANCHES
        // =====================================================

        if (receptionist) {

            receptionist.name = 'Gym Receptionist';
            receptionist.role = 'receptionist';
            receptionist.status = 'active';

            // BOTH BRANCHES
            receptionist.gymBranches = [
                'Kalyanpur',
                'Gopalpur',
            ];

            // Do not use the old single-branch field
            receptionist.gymBranch = null;

            // Keep password unchanged if the account already
            // has a password.
            if (!receptionist.password) {
                receptionist.password =
                    await bcrypt.hash(password, 10);
            }

            await receptionist.save();

            console.log('\nReceptionist updated successfully!');
            console.log('--------------------------------');
            console.log('Email:', receptionist.email);
            console.log('Role:', receptionist.role);
            console.log(
                'Branches:',
                receptionist.gymBranches
            );
            console.log('Status:', receptionist.status);
            console.log('--------------------------------');

            return;
        }

        // =====================================================
        // CREATE NEW RECEPTIONIST
        // =====================================================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        receptionist = await Admin.create({

            name: 'Gym Receptionist',

            email,

            password: hashedPassword,

            role: 'receptionist',

            status: 'active',

            // BOTH BRANCHES
            gymBranches: [
                'Kalyanpur',
                'Gopalpur',
            ],

            // Legacy single branch field
            gymBranch: null,

            permissions: {

                members: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                },

                payments: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                },

                attendance: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                },

                workouts: {
                    view: true,
                    add: true,
                    edit: true,
                    delete: false,
                },

                enquiries: {
                    view: true,
                    delete: false,
                },

                offers: {
                    view: true,
                    add: false,
                    edit: false,
                    delete: false,
                },

            },

        });

        console.log('\nReceptionist created successfully!');
        console.log('--------------------------------');
        console.log('Email:', receptionist.email);
        console.log('Password:', password);
        console.log('Role:', receptionist.role);
        console.log(
            'Branches:',
            receptionist.gymBranches
        );
        console.log('Status:', receptionist.status);
        console.log('--------------------------------');

    } catch (error) {

        console.error(
            'Error creating/updating receptionist:',
            error
        );

    } finally {

        await mongoose.disconnect();

        console.log('MongoDB disconnected');
    }
}

createOrUpdateReceptionist();