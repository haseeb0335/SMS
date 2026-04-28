import mongoose from 'mongoose';

const ExamFeeSchema = new mongoose.Schema({
    className: String,
    examType: String,
    amount: Number,
}, { timestamps: true });

export default mongoose.model('ExamFee', ExamFeeSchema);