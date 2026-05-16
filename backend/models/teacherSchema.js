import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({

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
    default: "Teacher"
  },

  // ✅ FIXED HERE
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  // ✅ FIXED HERE
  teachSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  },

  // ✅ FIXED HERE
  teachSclass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sclass",
    required: true
  },

  profilePic: {
    type: String,
    default: ""
  },

  attendance: [
    {
      date: {
        type: Date,
        default: Date.now
      },

      time: {
        type: String
      },

      status: {
        type: String,
        enum: ["Present", "Absent", "Leave"],
        default: "Present"
      },

      reason: {
        type: String
      },

      location: {
        latitude: Number,
        longitude: Number
      }
    }
  ]

}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);