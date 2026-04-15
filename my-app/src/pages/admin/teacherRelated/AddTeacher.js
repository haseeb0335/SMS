import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { 
    CircularProgress, Box, Container, Typography, 
    TextField, Button, Paper, Stack, IconButton, 
    InputAdornment, Card, Divider 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import styled from 'styled-components';

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const subjectID = params.id;

    const { status, response, error } = useSelector(state => state.user);
    const { subjectDetails } = useSelector((state) => state.sclass);

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
    }, [dispatch, subjectID]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const role = "Teacher";
    const school = subjectDetails && subjectDetails.school;
    const teachSubject = subjectDetails && subjectDetails._id;
    const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id;

    const fields = { name, email, password, role, school, teachSubject, teachSclass };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/teachers");
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <StyledPaper elevation={3}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <IconHeader>
                        <PersonAddIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                    </IconHeader>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mt: 2 }}>
                        Add Teacher
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Create a new faculty account
                    </Typography>
                </Box>

                <InfoCard variant="outlined">
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BookIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Subject: {subjectDetails?.subName || "Loading..."}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Class: {subjectDetails?.sclassName?.sclassName || "Loading..."}
                            </Typography>
                        </Box>
                    </Stack>
                </InfoCard>

                <Divider sx={{ my: 3 }} />

                <form onSubmit={submitHandler}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Teacher's Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={loader}
                            sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                backgroundColor: '#6366f1',
                                '&:hover': { backgroundColor: '#4f46e5' }
                            }}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Register Teacher'}
                        </Button>
                    </Stack>
                </form>
            </StyledPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddTeacher;

/* Modern Styled Components */

const StyledPaper = styled(Paper)`
    padding: 40px;
    border-radius: 24px !important;
    background-color: #ffffff !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;

    @media (max-width: 600px) {
        padding: 24px;
    }
`;

const IconHeader = styled(Box)`
    background-color: #f1f5f9;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
`;

const InfoCard = styled(Card)`
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    padding: 16px;
    border-radius: 12px !important;
`;
