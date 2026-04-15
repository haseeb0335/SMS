import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import Popup from '../../../components/Popup';
import { 
    Box, InputLabel, MenuItem, Select, Typography, Stack, 
    TextField, CircularProgress, FormControl, Container, 
    Paper, CardContent, Button, Divider, IconButton, 
    InputAdornment, Chip, Badge 
} from '@mui/material';
import { 
    ArrowBack, Assignment, Score, Event, 
    Book 
} from '@mui/icons-material';

const StudentExamMarks = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Redux States
    const { userDetails, loading: userLoading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);

    // Local States
    const [studentID, setStudentID] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [marksObtained, setMarksObtained] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // 1. Initial Data Fetching
    useEffect(() => {
        const id = situation === "Student" ? params.id : params.studentID;
        if (id) {
            setStudentID(id);
            dispatch(getUserDetails(id, "Student"));
        }
        
        if (situation === "Subject" && params.subjectID) {
            setChosenSubName(params.subjectID);
        }
    }, [situation, params, dispatch]);

    // 2. Fetch Subjects when Class ID is available
    useEffect(() => {
        if (userDetails?.sclassName?._id) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails?.sclassName?._id]);

    // 3. Sync Subject Name for Display
    useEffect(() => {
        if (subjectsList && chosenSubName) {
            const sub = subjectsList.find(s => s._id === chosenSubName);
            if (sub) setSubjectName(sub.subName);
        }
    }, [subjectsList, chosenSubName]);

    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(s => s.subName === event.target.value);
        if (selectedSubject) {
            setSubjectName(selectedSubject.subName);
            setChosenSubName(selectedSubject._id);
        }
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if (!chosenSubName) {
            setMessage("Please select a subject first");
            setShowPopup(true);
            return;
        }
        setLoader(true);
        const fields = { subName: chosenSubName, marksObtained, totalMarks, examDate };
        dispatch(updateStudentFields(studentID, fields, "UpdateExamResult"));
    };

    // 4. Handle Status Changes
    useEffect(() => {
        if (response || error || statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage(error ? "Error updating marks" : response || "Marks updated successfully!");
        }
    }, [response, statestatus, error]);

    // --- RENDER CHECK ---
    // We only show the full loader if we have NO student data yet.
    // If userDetails exists, we show the form even if Redux "loading" is true.
    if (userLoading && !userDetails) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography color="textSecondary">Fetching Student Records...</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                <ArrowBack />
            </IconButton>

            <Paper elevation={4} sx={{ borderRadius: 5, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Assignment fontSize="large" />
                        <Box>
                            <Typography variant="h5" fontWeight="700">Exam Marks Entry</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Student: {userDetails?.name || "Loading..."}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={4}>
                            {/* Subject Picker */}
                            <FormControl fullWidth required>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                    value={subjectName}
                                    label="Subject"
                                    onChange={changeHandler}
                                    disabled={situation === "Subject"}
                                    startAdornment={
                                        <InputAdornment position="start" sx={{ ml: 1 }}>
                                            <Book color="action" fontSize="small" />
                                        </InputAdornment>
                                    }
                                >
                                    {subjectsList?.length > 0 ? (
                                        subjectsList.map((sub, i) => (
                                            <MenuItem key={i} value={sub.subName}>{sub.subName}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No Subjects Found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Exam Date"
                                type="date"
                                fullWidth
                                required
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Event color="action" fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Divider>
                                <Chip label="RESULTS" size="small" />
                            </Divider>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    type="number"
                                    label="Obtained"
                                    fullWidth
                                    required
                                    value={marksObtained}
                                    onChange={(e) => setMarksObtained(e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Score color="success" fontSize="small" /></InputAdornment>,
                                    }}
                                />
                                <TextField
                                    type="number"
                                    label="Total"
                                    fullWidth
                                    required
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
                                />
                            </Stack>

                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                                sx={{ py: 1.5, borderRadius: 3, fontWeight: '700', textTransform: 'none' }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Save Marks"}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default StudentExamMarks;