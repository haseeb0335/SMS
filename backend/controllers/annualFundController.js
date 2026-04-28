import { Student } from "../models/studentSchema.js";
import mongoose from "mongoose";

// ✅ COLLECT ANNUAL FUND
export const collectAnnualFund = async (req, res) => {
    try {
        const { studentId, amount, date, feeMonth, receivedBy, fatherName } = req.body;
        
        const student = await Student.findById(studentId).populate("sclassName");
        if (!student) return res.status(404).json({ message: "Student not found" });

        const alreadyPaid = student.fees.find(f => f.feeMonth === feeMonth);
        if (alreadyPaid) {
            return res.status(400).json({ message: `Annual Fund (${feeMonth}) already paid for this student.` });
        }

        const newFundRecord = {
            _id: new mongoose.Types.ObjectId(),
            amount: Number(amount),
            date: date || new Date(),
            studentName: student.name,
            className: student.sclassName?.sclassName || "No Class",
            fatherName: fatherName || student.fatherName || "-",
            feeMonth: feeMonth, 
            previousDues: Number(amount),
            totalDues: 0, 
            receivedBy: receivedBy || "Admin",
            category: "AnnualFund" 
        };

        student.fees.push(newFundRecord);
        await student.save();

        res.status(201).json({ message: "Annual Fund collection successful", record: newFundRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error while collecting fund" });
    }
};

// ✅ GET ANNUAL FUND RECORDS ONLY
export const getAnnualFundRecords = async (req, res) => {
    try {
        const students = await Student.find().populate("sclassName");
        let fundCollections = [];

        students.forEach(student => {
            const funds = student.fees.filter(f => f.feeMonth && f.feeMonth.toLowerCase().includes("fund"));
            funds.forEach(f => {
                fundCollections.push({
                    ...f.toObject(),
                    studentId: student._id,
                    studentName: student.name
                });
            });
        });

        res.status(200).json(fundCollections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching fund records" });
    }
};

// ✅ EDIT ANNUAL FUND RECORD
export const editAnnualFund = async (req, res) => {
    try {
        const { id } = req.params; 
        const { amount, fatherName, collectorName, feeMonth, date } = req.body;

        const student = await Student.findOne({ "fees._id": id });

        if (!student) {
            return res.status(404).json({ message: "Record not found" });
        }

        const fee = student.fees.id(id);
        
        if (fee) {
            fee.amount = Number(amount) || fee.amount;
            fee.fatherName = fatherName || fee.fatherName;
            fee.collectorName = collectorName || fee.collectorName;
            fee.feeMonth = feeMonth || fee.feeMonth;
            fee.date = date || fee.date;
            fee.totalDues = (fee.previousDues || 0) - fee.amount;
        }

        await student.save();
        res.status(200).json({ message: "Annual Fund record updated successfully" });
    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};