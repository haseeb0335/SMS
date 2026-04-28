import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Utilities', 'Salaries', 'Maintenance', 'Stationery', 'Events', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin', // Links expense to a specific school/admin
        required: true
    }
}, { timestamps: true });

export default mongoose.model("expense", expenseSchema);