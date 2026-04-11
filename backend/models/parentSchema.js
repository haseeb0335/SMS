import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: "Parent" 
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    // Add this section to store leave requests
    leaves: [{
        leaveDate: { type: Date, required: true },
        leaveReason: { type: String, required: true },
        status: { type: String, default: "Pending" },
        appliedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Parent = mongoose.model("parent", parentSchema);
export default Parent;