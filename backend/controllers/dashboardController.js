const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

const {
    getBranchFilter,
} = require('../utils/branchAccess');


// =====================================
// GET TODAY IN INDIA
// =====================================

const getTodayAttendanceDay = () => {
    return new Intl.DateTimeFormat(
        'en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }
    ).format(
        new Date()
    );
};


// =====================================
// GET DASHBOARD STATS
// =====================================

const getDashboardStats = async(
    req,
    res
) => {
    try {

        // =====================================
        // AUTHENTICATION
        // =====================================

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }


        // =====================================
        // BRANCH FILTER
        // =====================================

        /*
         * Main admin:
         *     {} = all branches
         *
         * Branch user:
         *     { gymBranch: assignedBranch }
         *
         * If a main admin selects a branch,
         * getBranchFilter(req) should return
         * that selected branch.
         */

        const branchQuery =
            getBranchFilter(req);


        const memberQuery = {
            ...branchQuery,
        };


        const paymentQuery = {
            ...branchQuery,
        };


        const attendanceQuery = {
            ...branchQuery,
        };


        // =====================================
        // MEMBER STATISTICS
        // =====================================

        const totalMembers =
            await Member.countDocuments(
                memberQuery
            );


        const activeMembers =
            await Member.countDocuments({
                ...memberQuery,

                status: 'Active',
            });


        const expiredMembers =
            await Member.countDocuments({
                ...memberQuery,

                status: 'Expired',
            });


        // =====================================
        // PAYMENT STATISTICS
        // =====================================

        const totalPayments =
            await Payment.countDocuments(
                paymentQuery
            );


        // =====================================
        // TOTAL REVENUE
        // =====================================

        const revenueResult =
            await Payment.aggregate([

                {
                    $match: {
                        ...paymentQuery,

                        status: 'Paid',
                    },
                },

                {
                    $group: {

                        _id: null,

                        totalRevenue: {
                            $sum: '$amount',
                        },
                    },
                },

            ]);


        const totalRevenue =
            revenueResult.length > 0 ?
            Number(
                revenueResult[0]
                .totalRevenue
            ) :
            0;


        // =====================================
        // TODAY'S ATTENDANCE
        // =====================================

        /*
         * AttendanceController stores:
         *
         * attendanceDay:
         * YYYY-MM-DD
         *
         * Using this field avoids timezone
         * problems caused by comparing Date
         * objects across servers.
         */

        const today =
            getTodayAttendanceDay();


        const todayAttendance =
            await Attendance.countDocuments({

                ...attendanceQuery,

                attendanceDay: today,

                status: 'Present',
            });


        // =====================================
        // RESPONSE
        // =====================================

        return res.status(200).json({

            message: 'Dashboard statistics fetched successfully.',

            stats: {

                totalMembers,

                activeMembers,

                expiredMembers,

                totalPayments,

                totalRevenue,

                todayAttendance,

            },

        });

    } catch (error) {

        console.error(
            'Dashboard Stats Error:',
            error
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =====================================
// EXPORT
// =====================================

module.exports = {
    getDashboardStats,
};