import { Student } from "../models/studentSchema.js";
import mongoose from 'mongoose';

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
const getAllFees = async (req, res) => {
    try {
        const students = await Student.find().populate("sclassName");
        let allFees = [];

        students.forEach(student => {
            if (student.fees && Array.isArray(student.fees)) {
                student.fees.forEach(fee => {
                    allFees.push({
                        ...fee.toObject(),
                        studentId: student._id,
                        studentName: student.name,
                        className: student.sclassName?.sclassName || "Unassigned"
                    });
                });
            }
        });

        // Alphabetical Sort by Student Name for better UI
        allFees.sort((a, b) => a.studentName.localeCompare(b.studentName));

        res.status(200).json({ allFees }); // Keep it simple for frontend mapping
    } catch (error) {
        res.status(500).json({ message: error.message });
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


export { addFees, getStudentFees, getAllFees, deleteFee, editFee };
   
