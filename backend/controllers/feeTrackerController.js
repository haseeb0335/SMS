const Admission = require('../models/Admission'); // Your student records
const Fee = require('../models/Fee');             // Your paid fee records

/**
 * GET Class-wise Fee Status
 * This returns a list of all students grouped by class, 
 * marking each as "Paid" or "Unpaid" for the current month.
 */
const getClassWiseTracker = async (req, res) => {
    try {
        // 1. Fetch all students and all payment records
        const [students, paidRecords] = await Promise.all([
            Admission.find({}).select('studentName fatherName className'),
            Fee.find({}).select('studentName className date')
        ]);

        // 2. Cross-reference students with payments
        const trackerData = students.map(student => {
            // Check if there is a payment record for this student in their specific class
            const isPaid = paidRecords.some(record => 
                record.studentName.toLowerCase() === student.studentName.toLowerCase() &&
                record.className === student.className
            );

            return {
                _id: student._id,
                studentName: student.studentName,
                fatherName: student.fatherName,
                className: student.className,
                status: isPaid ? 'Paid' : 'Unpaid'
            };
        });

        // 3. Optional: Group by class on the backend to save frontend processing
        const groupedByClass = trackerData.reduce((acc, curr) => {
            if (!acc[curr.className]) acc[curr.className] = [];
            acc[curr.className].push(curr);
            return acc;
        }, {});

        res.status(200).json(groupedByClass);
    } catch (error) {
        console.error("Tracker Error:", error);
        res.status(500).json({ 
            message: "Failed to generate fee tracking data", 
            error: error.message 
        });
    }
};

/**
 * GET Monthly Summary
 * Provides a high-level overview of collection progress
 */
const getFeeStats = async (req, res) => {
    try {
        const totalStudents = await Admission.countDocuments();
        const paidStudents = await Fee.countDocuments();
        
        const stats = {
            total: totalStudents,
            paid: paidStudents,
            unpaid: totalStudents - paidStudents,
            percentage: totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(2) : 0
        };

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Error fetching statistics", error });
    }
};

module.exports = {
    getClassWiseTracker,
    getFeeStats
};