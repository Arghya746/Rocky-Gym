require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createReceptionist() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected');

        const email = 'reception@alphagym.com';
        const password = 'Reception@123';

        const existing = await Admin.findOne({ email });

        if (existing) {
            console.log('Receptionist already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const receptionist = await Admin.create({
            name: 'Gym Receptionist',
            email,
            password: hashedPassword,
            role: 'receptionist',
            status: 'active',

            gymBranches: [
                'Kalyanpur',
                'Gopalpur',
            ],

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
        console.log('Branches:', receptionist.gymBranches);
        console.log('Status:', receptionist.status);
        console.log('--------------------------------');

    } catch (error) {
        console.error('Error creating receptionist:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
}

createReceptionist();