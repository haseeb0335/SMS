import express from "express";
const router = express.Router();

// Import Controllers (ES Module Style)
import { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } from '../controllers/admin-controller.js';
import { addSalary, getTeacherSalaries, getAllSalaries, deleteSalary, editSalary } from '../controllers/salary-controller.js';
import { getStudentAnalytics, parentRegister, parentLogIn, applyLeave, approveLeave, getParentByStudent, getParentDetail, updateLeave, deleteLeave } from '../controllers/parent-controller.js';
import { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } from '../controllers/class-controller.js';
import { complainCreate, complainList, complainDelete } from '../controllers/complain-controller.js';
import { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } from '../controllers/notice-controller.js';
import {
    studentRegister,
    studentLogIn,
    getStudentProfileDetailed,
    getStudents,
    getStudentDetail,
    getClassStudentsWithAttendance,
    deleteStudents,
    deleteStudent,
    removeStudentMark,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    deleteSingleAttendance,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    createQuiz,
    getQuizByClass,
    submitQuiz,
    deleteQuiz,
    updateQuiz,
    getClassStudents,
    deleteStudentQuizResult,
    removeStudentAttendance
} from '../controllers/student_controller.js';
import { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } from '../controllers/subject-controller.js';
import { teacherRegister, teacherLogIn, getTeachers, getTeachersByClass, getTeacherAttendance, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance, updateTeacher, deleteTeacherAttendance, removeTeacherAttendance } from '../controllers/teacher-controller.js';
import { addFees, getStudentFees, getAllFees, deleteFee, editFee } from "../controllers/Fees-controller.js";
import { addExpense, getExpenses, deleteExpense, updateExpense } from '../controllers/expense-controller.js';
import { createAdmission, getAllAdmissions, updateAdmission, deleteAdmission, createExamFee, getAllExamFees, updateExamFee, deleteExamFee } from '../controllers/admissionController.js';
import { collectAnnualFund, getAnnualFundRecords, editAnnualFund } from '../controllers/annualFundController.js';

// --- ROUTES ---

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", getAdminDetail);
router.delete("/Admin/:id", deleteAdmin);
router.put("/Admin/:id", updateAdmin);

// Admission Fees
router.post('/AdmissionFees', createAdmission);
router.get('/Admissions', getAllAdmissions);
router.put('/Admission/:id', updateAdmission);
router.delete('/Admission/:id', deleteAdmission);

// Exam Fees
router.post('/ExamFees', createExamFee);
router.get('/ExamFees', getAllExamFees);
router.put('/ExamFee/:id', updateExamFee);
router.delete('/ExamFee/:id', deleteExamFee);

// Parents route
router.get("/StudentAnalytics/:id", getStudentAnalytics);
router.post('/ParentReg', parentRegister);
router.post('/ParentLogin', parentLogIn);
router.post('/ApplyLeave', applyLeave);
router.get("/Parent/:id", getParentDetail);
router.put("/UpdateLeave/:parentId/:leaveId", updateLeave);
router.delete("/DeleteLeave/:parentId/:leaveId", deleteLeave);
router.put("/ApproveLeave/:parentId/:leaveId", approveLeave);
router.get("/ParentByStudent/:id", getParentByStudent);

// fees section
router.post("/AddFees", addFees);
router.get("/StudentFees/:id", getStudentFees);
router.get("/AllFees", getAllFees);
router.put("/DeleteFee/:id", deleteFee);
router.put("/EditFee/:id", editFee);

// Annual fund Routes
router.post('/CollectAnnualFund', collectAnnualFund);
router.get('/AnnualFundRecords', getAnnualFundRecords);
router.put('/EditAnnualFund/:id', editAnnualFund);

// Salary Routes
router.post("/AddSalary", addSalary);
router.get("/TeacherSalaries/:id", getTeacherSalaries);
router.get("/AllSalaries/:id", getAllSalaries);
router.delete("/DeleteSalary/:id", deleteSalary);
router.put("/EditSalary/:id", editSalary);

// expense 
router.post('/ExpenseCreate', addExpense);
router.get('/ExpenseList/:id', getExpenses);
router.delete('/ExpenseDelete/:id', deleteExpense);
router.put('/ExpenseUpdate/:id', updateExpense);

// Student
router.delete("/deleteQuiz/:id", deleteQuiz);
router.get("/Sclass/Students/:id", getClassStudents);
router.get('/StudentProfile/:id', getStudentProfileDetailed);
router.get("/Sclass/StudentsAttendance/:id", getClassStudentsWithAttendance);
router.put("/updateQuiz/:id", updateQuiz);
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn);
router.get("/Students/:id", getStudents);
router.get("/Student/:id", getStudentDetail);
router.delete("/Students/:id", deleteStudents);
router.delete("/StudentsClass/:id", deleteStudentsByClass);
router.delete("/Student/:id", deleteStudent);
router.put("/Student/:id", updateStudent);
router.put('/RemoveStudentMark/:id', removeStudentMark);
router.put('/UpdateExamResult/:id', updateExamResult);
router.put('/StudentAttendance/:id', studentAttendance);
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance);
router.delete('/DeleteStudentAttendance/:studentId/:attendanceId', deleteSingleAttendance);
router.post("/createQuiz", createQuiz);
router.get("/getQuiz/:className", getQuizByClass);
router.post("/submitQuiz", submitQuiz);
router.delete("/deleteQuizResult/:studentId/:resultId", deleteStudentQuizResult);

// Teacher
router.delete('/DeleteTeacherAttendance/:teacherId/:attenId', deleteTeacherAttendance);
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get('/TeacherAttendance/:id', getTeacherAttendance);
router.get("/Teachers/:id", getTeachers);
router.get("/TeachersClass/:id", getTeachersByClass);
router.get("/Teacher/:id", getTeacherDetail);
router.delete("/Teachers/:id", deleteTeachers);
router.delete("/TeachersClass/:id", deleteTeachersByClass);
router.delete("/Teacher/:id", deleteTeacher);
router.put("/TeacherSubject", updateTeacherSubject);
router.post('/TeacherAttendance/:id', teacherAttendance);
router.put("/Teacher/:id", updateTeacher);
router.put("/RemoveTeacherAtten/:id", removeTeacherAttendance);

// Notice
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices);
router.delete("/Notice/:id", deleteNotice);
router.put("/Notice/:id", updateNotice);

// Complain
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);
router.delete('/ComplainDelete/:id', complainDelete);

// Sclass
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail);
router.get("/Sclass/Students/:id", getSclassStudents);
router.delete("/Sclasses/:id", deleteSclasses);
router.delete("/Sclass/:id", deleteSclass);

// Subject
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail);
router.delete("/Subject/:id", deleteSubject);
router.delete("/Subjects/:id", deleteSubjects);
router.delete("/SubjectsClass/:id", deleteSubjectsByClass);

export { router };