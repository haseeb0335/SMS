import React, { useEffect, useState } from "react";
import { 
    Button, TextField, Grid, Box, Typography, 
    CircularProgress, Paper, IconButton, Divider, Container 
} from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SubjectIcon from '@mui/icons-material/Subject';
import styled from "styled-components";

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const sclassName = params.id
    const adminID = currentUser._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectNameChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subName = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value;
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <StyledContainer>
            <StyledBox>
                <StackHeader>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SubjectIcon color="primary" />
                        <Typography variant="h5" fontWeight="600" color="#1e293b">
                            Add Subjects
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="#64748b">
                        Create multiple subjects for this class at once
                    </Typography>
                </StackHeader>

                <form onSubmit={submitHandler}>
                    {subjects.map((subject, index) => (
                        <SubjectCard key={index} elevation={0}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight="bold" color="#6366f1">
                                    Subject #{index + 1}
                                </Typography>
                                {index !== 0 && (
                                    <IconButton color="error" onClick={handleRemoveSubject(index)} size="small">
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Subject Name"
                                        variant="outlined"
                                        value={subject.subName}
                                        onChange={handleSubjectNameChange(index)}
                                        required
                                        InputProps={{ sx: { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Subject Code"
                                        variant="outlined"
                                        value={subject.subCode}
                                        onChange={handleSubjectCodeChange(index)}
                                        required
                                        InputProps={{ sx: { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Sessions"
                                        variant="outlined"
                                        type="number"
                                        inputProps={{ min: 0 }}
                                        value={subject.sessions}
                                        onChange={handleSessionsChange(index)}
                                        required
                                        InputProps={{ sx: { borderRadius: '10px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </SubjectCard>
                    ))}

                    <Box mt={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleAddSubject}
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                        >
                            Add Another Subject
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loader}
                            sx={{ 
                                borderRadius: '10px', 
                                px: 5, 
                                py: 1.2, 
                                textTransform: 'none',
                                backgroundColor: '#6366f1',
                                '&:hover': { backgroundColor: '#4f46e5' }
                            }}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Save All Subjects'}
                        </Button>
                    </Box>
                </form>
            </StyledBox>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </StyledContainer>
    );
}

export default SubjectForm;

const StyledContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px;
`;

const StyledBox = styled(Box)`
  max-width: 800px;
  margin: 0 auto;
`;

const StackHeader = styled(Box)`
  margin-bottom: 30px;
  text-align: center;
`;

const SubjectCard = styled(Paper)`
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
  }
`;
