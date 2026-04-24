const { Student } = require("../models/studentSchema");
const mongoose = require("mongoose");

// ✅ ADD FEE
const addFees = async (req, res) => {
    try {
        // Destructure all new fields from the request body
        const { 
            studentId, 
            amount, 
            date, 
            fatherName, 
            feeMonth, 
            previousDues, 
            totalDues, 
            receivedBy 
        } = req.body; 
        
        const student = await Student.findById(studentId).populate("sclassName");

        if (!student) return res.status(404).json({ message: "Student not found" });

        const selectedDate = new Date(date);
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();

        // Check if fee already exists for the SELECTED month
        const alreadyPaid = student.fees.find(fee => {
            const d = new Date(fee.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (alreadyPaid) return res.status(400).json({ message: "Fee already paid for this selected month" });

     // ✅ Calculate balance properly
const safePrevious = Number(previousDues) || 0;
const safeAmount = Number(amount) || 0;
const calculatedBalance = safePrevious - safeAmount;

const newFee = {
    _id: new mongoose.Types.ObjectId(),
    amount: safeAmount,
    date: selectedDate,
    studentName: student.name,
    className: student.sclassName?.sclassName || "No Class",

    fatherName: fatherName || "-",
    feeMonth: feeMonth || "-",
    previousDues: safePrevious,

    // ✅ Always correct now
    totalDues: calculatedBalance,

    receivedBy: receivedBy || "-"
};

        student.fees.push(newFee);
        await student.save();
        res.status(200).json({ message: "Fee added", fee: newFee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// Replace your existing getAllFees with this version
const getAllFees = async (req, res) => {
    try {
        const students = await Student.find().populate("sclassName");

        let allFees = [];

        students.forEach(student => {
            if (student.fees && Array.isArray(student.fees)) {
                student.fees.forEach(fee => {

                    // ✅ FIX: ensure all fields always exist
                    const safeFather = fee.fatherName || student.fatherName || "-";
                    const safeMonth = fee.feeMonth || "-";
                    const safeReceivedBy = fee.receivedBy || "-";

                    // ✅ FIX: calculate balance if missing
                    const safePrevious = fee.previousDues || 0;
                    const safeAmount = fee.amount || 0;
                    const safeTotalDues = 
                        typeof fee.totalDues === "number"
                        ? fee.totalDues
                        : (safePrevious - safeAmount);

                    allFees.push({
                        _id: fee._id,
                        studentId: student._id,
                        amount: safeAmount,
                        date: fee.date,
                        studentName: student.name || "Unknown",
                        className: student.sclassName?.sclassName || "Class Not Assigned",

                        // ✅ Always filled now
                        fatherName: safeFather,
                        feeMonth: safeMonth,
                        previousDues: safePrevious,
                        totalDues: safeTotalDues,
                        receivedBy: safeReceivedBy
                    });
                });
            }
        });

        res.status(200).json(allFees);

    } catch (error) {
        console.error("Error in getAllFees:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// DELETE FEE
const deleteFee = async (req, res) => {
    try {
        const feeId = req.params.id;
        const student = await Student.findOne({ "fees._id": feeId });

        if (!student) {
            return res.status(404).json({ message: "Fee not found" });
        }

        student.fees = student.fees.filter(
            (fee) => fee._id.toString() !== feeId
        );

        await student.save();
        res.status(200).json({ message: "Fee deleted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting fee" });
    }
};

// EDIT FEE
const editFee = async (req, res) => {
    try {
        const feeId = req.params.id;
        const { amount } = req.body;

        const student = await Student.findOne({
            "fees._id": feeId
        });

        if (!student) {
            return res.status(404).json({ message: "Fee not found" });
        }

        const fee = student.fees.id(feeId);

        if (!fee) {
            return res.status(404).json({ message: "Fee not found" });
        }

        fee.amount = amount;
        await student.save();
        res.status(200).json({ message: "Fee updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ GET FEES
const getStudentFees = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({
            fees: student.fees || []
        });

    } catch (error) {
        console.log("GET FEES ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const getClassWiseTracker = async (req, res) => {
    try {
        const [students, paidRecords] = await Promise.all([
            Admission.find({}).select('_id studentName fatherName className'),
            Fee.find({}).select('studentName className')
        ]);

        // Create a Set of paid students (safe + fast)
        const paidSet = new Set(
            paidRecords.map(record => 
                `${record.studentName?.trim().toLowerCase()}-${record.className}`
            )
        );

        const trackerData = students.map(student => {
            const key = `${student.studentName?.trim().toLowerCase()}-${student.className}`;

            return {
                _id: student._id,
                studentName: student.studentName,
                fatherName: student.fatherName,
                className: student.className,
                status: paidSet.has(key) ? 'Paid' : 'Unpaid'
            };
        });

        // Group by class
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
 */
const getFeeStats = async (req, res) => {
    try {
        const totalStudents = await Admission.countDocuments();

        // Get unique students who paid
        const paidStudentsData = await Fee.distinct('studentName');
        const paidStudents = paidStudentsData.length;

        const stats = {
            total: totalStudents,
            paid: paidStudents,
            unpaid: totalStudents - paidStudents,
            percentage:
                totalStudents > 0
                    ? ((paidStudents / totalStudents) * 100).toFixed(2)
                    : 0
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({
            message: "Error fetching statistics",
            error: error.message
        });
    }
};

module.exports = {
    addFees,
    getStudentFees, 
    getAllFees, 
    deleteFee,
    editFee,
    getClassWiseTracker,
    getFeeStats
};