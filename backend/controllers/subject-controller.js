import mongoose from 'mongoose';
import Subject from '../models/subjectSchema.js';
import Teacher from '../models/teacherSchema.js';
import { Student } from '../models/studentSchema.js';

export const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        const existingSubjectBySubCode = await Subject.findOne({
            subCode: subjects[0].subCode,
            school: req.body.adminID,
        });

        if (existingSubjectBySubCode) {
            res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        } else {
            const newSubjects = subjects.map((subject) => ({
                ...subject,
                sclassName: req.body.sclassName,
                school: req.body.adminID,
            }));

            const result = await Subject.insertMany(newSubjects);
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const allSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const classSubjects = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const freeSubjectList = async (req, res) => {
    try {
        let subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getSubjectDetail = async (req, res) => {
    try {
        let subject = await Subject.findById(req.params.id);
        if (subject) {
            subject = await subject.populate("sclassName", "sclassName");
            subject = await subject.populate("teacher", "name");
            res.send(subject);
        } else {
            res.send({ message: "No subject found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            {},
            { $pull: { examResult: { subName: deletedSubject._id }, attendance: { subName: deletedSubject._id } } }
        );

        res.send(deletedSubject);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteSubjects = async (req, res) => {
    try {
        const result = await Subject.deleteMany({ school: req.params.id });

        await Teacher.updateMany(
            { school: req.params.id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            { school: req.params.id },
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deleteSubjectsByClass = async (req, res) => {
    try {
        const result = await Subject.deleteMany({ sclassName: req.params.id });

        await Teacher.updateMany(
            { sclassName: req.params.id },
            { $unset: { teachSubject: "" } }
        );

        await Student.updateMany(
            { sclassName: req.params.id },
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};