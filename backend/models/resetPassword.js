require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function setupReceptionist() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB');

        const email = 'reception@alphagym.com';
        const newPassword = 'Reception@123';

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        const admin =
            await Admin.findOneAndUpdate({ email },

                {
                    $set: {
                        password: hashedPassword,

                        role: 'receptionist',

                        status: 'active',

                        gymBranches: [
                            'Kalyanpur',
                            'Gopalpur'
                        ],

                        // Legacy field
                        gymBranch: null
                    }
                },

                {
                    new: true,
                    runValidators: true
                }
            );

        if (!admin) {
            console.log(
                '❌ Receptionist account not found.'
            );
            return;
        }

        console.log('');
        console.log(
            '================================'
        );
        console.log(
            'RECEPTIONIST ACCOUNT UPDATED'
        );
        console.log(
            '================================'
        );

        console.log(
            'Email:',
            admin.email
        );

        console.log(
            'Role:',
            admin.role
        );

        console.log(
            'gymBranches:',
            admin.gymBranches
        );

        console.log(
            'gymBranch:',
            admin.gymBranch
        );

        console.log(
            'Status:',
            admin.status
        );

        console.log(
            'Password:',
            newPassword
        );

        console.log(
            '================================'
        );

    } catch (error) {

        console.error(
            '❌ Error updating receptionist:',
            error
        );

    } finally {

        await mongoose.disconnect();

        console.log(
            'MongoDB connection closed.'
        );
    }
}

setupReceptionist();