const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
    studentName: String,
    fatherName: String,
    dob: String,
    whatsapp: String,
    className: String,
    feeAmount: Number,
    discount: Number,
    securityDeposit: Number,
    annualFund: Number,
}, { timestamps: true });

const ExamFeeSchema = new mongoose.Schema({
    className: String,
    examType: String,
    amount: Number,
}, { timestamps: true });

module.exports = mongoose.model('Admission', AdmissionSchema);
module.exports = mongoose.model('ExamFee', ExamFeeSchema);