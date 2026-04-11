const mongoose = require('mongoose');

// ✅ Define Fee Schema separately for better structure
const feeSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    studentName: { type: String },
    className: { type: String }
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
    // ✅ Fees Array using the sub-schema
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