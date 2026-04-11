import bcrypt from "bcrypt";
import Teacher from "../models/teacherSchema.js";
import Subject  from'../models/subjectSchema.js';

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        let teachers = await Teacher.find({
            school: req.params.id   // ✅ FIX HERE
        })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");

        res.send(teachers);
    } catch (err) {
        res.status(500).json(err);
    }
};
const getTeachersByClass = async (req, res) => {
    try {
        const teachers = await Teacher.find({
            teachSclass: req.params.id
        })
        .populate("teachSubject", "subName")
        .populate("teachSclass", "sclassName");

        res.send(teachers);
    } catch (err) {
        res.status(500).json(err);
    }
};
const getTeacherDetail = async (req, res) => {

  try {

    const teacher = await Teacher.findById(req.params.id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.password = undefined;

    res.status(200).json(teacher);

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: "Server error" });

  }

};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

// controllers/teacherController.js

const updateTeacher = async (req, res) => {

  try {

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.name = req.body.name || teacher.name;
    teacher.email = req.body.email || teacher.email;
    teacher.schoolName = req.body.schoolName || teacher.schoolName;
    teacher.password = req.body.password || teacher.password;

    // avatar update
    if (req.body.profilePic) {
      teacher.profilePic = req.body.profilePic;
    }

    const updatedTeacher = await teacher.save();

    updatedTeacher.password = undefined;

    res.send(updatedTeacher);

  } catch (error) {

    res.status(500).json(error);

  }

};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};
// Get Teacher Attendance by class
const getTeacherAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher.attendance || []);

  } catch (error) {
    res.status(500).json(error);
  }
};

 const removeTeacherAttendance = async (req, res) => {

  try {

    const teacherId = req.params.id;
    const { recordId } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.attendance = teacher.attendance.filter(
      (rec) => rec._id.toString() !== recordId
    );

    await teacher.save();

    res.status(200).json({ message: "Attendance deleted successfully" });

  } catch (error) {

    res.status(500).json(error);

  }

};
const teacherAttendance = async (req, res) => {

  try {

    const teacherId = req.params.id;

    const { date, status, location, time, reason } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (!teacher.attendance) {
      teacher.attendance = [];
    }

    const attendanceData = {
      date: date ? new Date(date) : new Date(),
      time: time || null,
      status: status || "Present",
      reason: reason || null,
      location: location || null
    };

    teacher.attendance.push(attendanceData);

    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      attendance: teacher.attendance
    });

  } catch (error) {

    console.error("Teacher Attendance Error:", error);

    res.status(500).json({
      message: "Server error while saving attendance"
    });

  }

};
const deleteTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, attenId } = req.params;

    const teacher = await Teacher.findById(teacherId);

    teacher.attendance = teacher.attendance.filter(
      (att) => att._id.toString() !== attenId
    );

    await teacher.save();

    res.send({ message: "Attendance deleted" });

  } catch (error) {
    res.status(500).json(error);
  }
};

export {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    getTeachersByClass,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    updateTeacher,
    getTeacherAttendance,
    teacherAttendance,
    removeTeacherAttendance,
    deleteTeacherAttendance
};