const mongoose = require('mongoose');
require('dotenv').config();

const Offer = require('./models/Offer');
const AccessPass = require('./models/AccessPass');

/* =========================================================
   MONGODB CONNECTION
   ========================================================= */

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/alpha-gym';

/* =========================================================
   VALID BRANCHES
   ========================================================= */

const BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

/* =========================================================
   DEFAULT PUJA OFFERS
   ========================================================= */

const PUJA_OFFERS = [{
        name: 'Puja Basic',
        durationMonths: 1,
        offerPrice: 999,

        description: 'Monthly Puja Offer. Admission Fee ₹499.',

        benefits: [
            'Monthly Package',
            'Admission Fee ₹499',
        ],
    },

    {
        name: 'Puja Standard',
        durationMonths: 3,
        offerPrice: 2699,

        description: 'Quarterly Puja Offer. Admission Fee FREE.',

        benefits: [
            'Quarterly Package',
            'Admission Fee FREE',
        ],
    },

    {
        name: 'Puja Premium',
        durationMonths: 6,
        offerPrice: 5199,

        description: 'Half Yearly Puja Offer. Admission Fee FREE.',

        benefits: [
            '6 Months Package',
            'Admission Fee FREE',
        ],
    },

    {
        name: 'Puja Ultimate',
        durationMonths: 12,
        offerPrice: 9999,

        description: 'Yearly Puja Offer. Admission Fee FREE.',

        benefits: [
            '12 Months Package',
            'Admission Fee FREE',
        ],
    },
];

/* =========================================================
   DEFAULT ACCESS PASSES
   ========================================================= */

const ACCESS_PASSES = [{
        passType: 'Daily Access',
        price: 200,
        durationDays: 1,

        description: 'One-day gym access.',
    },

    {
        passType: 'Weekly Access',
        price: 800,
        durationDays: 7,

        description: 'Seven-day gym access.',
    },
];

/* =========================================================
   SEED FUNCTION
   ========================================================= */

async function seedDefaultOffers() {
    try {
        console.log('');
        console.log('Connecting to MongoDB...');

        await mongoose.connect(MONGO_URI);

        console.log('MongoDB connected successfully.');
        console.log('');

        /* =====================================================
           CREATE DATA FOR EACH BRANCH
           ===================================================== */

        for (const gymBranch of BRANCHES) {

            console.log('========================================');
            console.log(`Processing branch: ${gymBranch}`);
            console.log('========================================');

            /* =================================================
               PUJA OFFERS
               ================================================= */

            for (const offerData of PUJA_OFFERS) {

                const existingOffer = await Offer.findOne({
                    gymBranch,
                    name: offerData.name,
                });

                if (existingOffer) {

                    console.log(
                        `Already exists: ${gymBranch} - ${offerData.name}`
                    );

                    continue;
                }

                /*
                 * Offers are active starting today.
                 *
                 * End date is one year from today so the
                 * dashboard can immediately display them.
                 */

                const startDate = new Date();

                const endDate = new Date(startDate);
                endDate.setFullYear(
                    endDate.getFullYear() + 1
                );

                await Offer.create({
                    gymBranch,

                    name: offerData.name,

                    durationMonths: offerData.durationMonths,

                    offerPrice: offerData.offerPrice,

                    startDate,

                    endDate,

                    description: offerData.description,

                    benefits: offerData.benefits,

                    image: '',

                    isActive: true,
                });

                console.log(
                    `Created Puja Offer: ${gymBranch} - ${offerData.name}`
                );
            }

            /* =================================================
               DAILY / WEEKLY ACCESS
               ================================================= */

            for (const passData of ACCESS_PASSES) {

                const existingPass =
                    await AccessPass.findOne({
                        gymBranch,
                        passType: passData.passType,
                        isActive: true,
                    });

                if (existingPass) {

                    console.log(
                        `Already exists: ${gymBranch} - ${passData.passType}`
                    );

                    continue;
                }

                await AccessPass.create({
                    gymBranch,

                    passType: passData.passType,

                    price: passData.price,

                    description: passData.description,

                    durationDays: passData.durationDays,

                    isActive: true,
                });

                console.log(
                    `Created Access Pass: ${gymBranch} - ${passData.passType}`
                );
            }

            console.log('');
        }

        /* =====================================================
           FINAL RESULT
           ===================================================== */

        console.log('');
        console.log('========================================');
        console.log('DEFAULT DATA SEED COMPLETED');
        console.log('========================================');
        console.log('');
        console.log('Kalyanpur:');
        console.log('  - Daily Access   ₹200');
        console.log('  - Weekly Access  ₹800');
        console.log('  - Puja Basic     ₹999');
        console.log('  - Puja Standard  ₹2699');
        console.log('  - Puja Premium   ₹5199');
        console.log('  - Puja Ultimate  ₹9999');
        console.log('');
        console.log('Gopalpur:');
        console.log('  - Daily Access   ₹200');
        console.log('  - Weekly Access  ₹800');
        console.log('  - Puja Basic     ₹999');
        console.log('  - Puja Standard  ₹2699');
        console.log('  - Puja Premium   ₹5199');
        console.log('  - Puja Ultimate  ₹9999');
        console.log('');
        console.log('Total expected records: 12');
        console.log('');

        await mongoose.disconnect();

        console.log('MongoDB disconnected.');
        process.exit(0);

    } catch (error) {

        console.error('');
        console.error('========================================');
        console.error('SEED ERROR');
        console.error('========================================');
        console.error(error);
        console.error('');

        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error(
                'MongoDB disconnect error:',
                disconnectError
            );
        }

        process.exit(1);
    }
}

/* =========================================================
   RUN
   ========================================================= */

seedDefaultOffers();