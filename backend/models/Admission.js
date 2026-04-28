import mongoose from 'mongoose';

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

export default mongoose.model('Admission', AdmissionSchema);