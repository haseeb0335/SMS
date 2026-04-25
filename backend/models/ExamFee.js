const mongoose = require('mongoose');

const ExamFeeSchema = new mongoose.Schema({
    className: String,
    examType: String,
    amount: Number,
}, { timestamps: true });

module.exports = mongoose.model('ExamFee', ExamFeeSchema);