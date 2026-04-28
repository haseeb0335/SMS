import bcrypt from 'bcrypt';
import { Student, Quiz } from '../models/studentSchema.js';
import Subject from '../models/subjectSchema.js';

export const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            return res.send({ message: 'Roll Number already exists' });
        }

        const student = new Student({
            ...req.body,
            password: hashedPass,
            school: req.body.adminID,
        });

        let result = await student.save();
        result.password = undefined;
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName");
                student = await student.populate("sclassName", "sclassName");
                student.password = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getClassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (students.length > 0) {
            const modifiedStudents = students.map((student) => {
                const sortedResults = student.quizResults.sort((a, b) => b.score - a.score);
                return { 
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum,
                    quizResults: sortedResults 
                };
            });
            modifiedStudents.sort((a, b) => {
                const maxA = a.quizResults.length > 0 ? Math.max(...a.quizResults.map(r => r.score)) : 0;
                const maxB = b.quizResults.length > 0 ? Math.max(...b.quizResults.map(r => r.score)) : 0;
                return maxB - maxA;
            });
            res.send(modifiedStudents);
        } else {
            res.send([]);
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching class students", error: err });
    }
};

export const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        } else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const removeStudentMark = async (req, res) => {
    try {
        const { subId } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.examResult = student.examResult.filter((item) => item.subName.toString() !== subId);
        await student.save();
        res.status(200).json({ message: "Mark removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        let result = await Student.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        result.password = undefined;
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.send({ message: 'Student not found' });

        const existingResult = student.examResult.find((result) => result.subName.toString() === subName);
        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }
        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        const subject = await Subject.findById(subName);
        const existingAttendance = student.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString() && a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            student.attendance.push({ date, status, subName });
        }
        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const clearAllStudentsAttendanceBySubject = async (req, res) => {
    try {
        const result = await Student.updateMany(
            { 'attendance.subName': req.params.id },
            { $pull: { attendance: { subName: req.params.id } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const clearAllStudentsAttendance = async (req, res) => {
    try {
        const result = await Student.updateMany({ school: req.params.id }, { $set: { attendance: [] } });
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const removeStudentAttendanceBySubject = async (req, res) => {
    try {
        const result = await Student.updateOne(
            { _id: req.params.id },
            { $pull: { attendance: { subName: req.body.subId } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const removeStudentAttendance = async (req, res) => {
    try {
        const result = await Student.updateOne({ _id: req.params.id }, { $set: { attendance: [] } });
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteSingleAttendance = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        student.attendance = student.attendance.filter((att) => att._id.toString() !== req.params.attendanceId);
        await student.save();
        res.send({ message: "Attendance deleted successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz({ ...req.body, date: new Date() });
        const result = await quiz.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuizByClass = async (req, res) => {
    try {
        const classQuizzes = await Quiz.find({ className: req.params.className });
        res.send(classQuizzes);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const result = await Quiz.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const result = await Quiz.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const submitQuiz = async (req, res) => {
    try {
        const { studentId, quizId, answers } = req.body;
        const quiz = await Quiz.findById(quizId);
        let score = 0;
        quiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });

        const student = await Student.findById(studentId);
        student.quizResults.push({
            quizTitle: quiz.title,
            score: score,
            total: quiz.questions.length,
            date: new Date()
        });
        await student.save();
        res.status(200).json({ score, total: quiz.questions.length, quizTitle: quiz.title });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

export const deleteStudentQuizResult = async (req, res) => {
    try {
        const result = await Student.findByIdAndUpdate(
            req.params.studentId,
            { $pull: { quizResults: { _id: req.params.resultId } } },
            { new: true }
        );
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

export const getClassStudentsWithAttendance = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        const formattedStudents = students.map((s) => ({ _id: s._id, name: s.name, rollNum: s.rollNum, attendance: s.attendance }));
        res.send(formattedStudents);
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
};

export const getStudentProfileDetailed = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .lean();
        if (student) {
            const { password, ...studentData } = student;
            res.status(200).json(studentData);
        } else {
            res.status(404).json({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};