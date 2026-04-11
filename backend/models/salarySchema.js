import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    teacherName: { type: String },
    month: { type: String, required: true },
    year: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "Paid" }
}, { timestamps: true });

const Salary = mongoose.model("salary", salarySchema);
export default Salary;