const mongoose = require('mongoose');

// ✅ Updated Fee Schema with your new fields
const feeSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    studentName: { type: String },
    className: { type: String },
    // NEW FIELDS ADDED BELOW:
    fatherName: { type: String },
    feeMonth: { type: String },
    previousDues: { type: Number, default: 0 },
    totalDues: { type: Number, default: 0 },
    receivedBy: { type: String }
});

const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    rollNum: { 
        type: Number, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    sclassName: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'sclass', 
        required: true 
    },
    school: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'admin', 
        required: true 
    },
    role: { 
        type: String, 
        default: "Student" 
    },

email: { type: String },
phone: { type: String },
dob: { type: String },
gender: { type: String },
address: { type: String },
emergencyContact: { type: String },
profilePicture: { type: String },
    // ✅ Fees Array using the updated sub-schema
    fees: [feeSchema],

    quizResults: [
        {
            quizTitle: String,
            score: Number,
            total: Number,
            date: { type: Date, default: Date.now }
        }
    ],
    examResult: [
        {
            subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
            marksObtained: { type: Number, default: 0 }
        }
    ],
    attendance: [
        {
            date: { type: Date, required: true },
            status: { type: String, enum: ['Present', 'Absent'], required: true },
            subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true }
        }
    ]
});

const quizSchema = new mongoose.Schema({
    className: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "sclass" 
    },
    title: String,
    date: { type: Date, default: Date.now },
    questions: [
        {
            question: String,
            options: [String],
            correctAnswer: String
        }
    ],
    // Added school reference to keep quizzes isolated by school
    school: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'admin' 
    }
});

const Student = mongoose.model("student", studentSchema);
const Quiz = mongoose.model("quiz", quizSchema);

module.exports = { Student, Quiz };