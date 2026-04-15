import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses, getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { 
    CircularProgress, Autocomplete, TextField, Box, Typography, 
    Paper, Divider, Button, InputAdornment, Container 
} from '@mui/material';
import Popup from '../../../components/Popup';

// Icons
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import ChildCareIcon from '@mui/icons-material/ChildCare';

const AddParent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, currentUser } = useSelector(state => state.user);
    const { sclassesList, sclassStudents } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentId, setStudentId] = useState('');
    
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const role = "Parent";
    const school = currentUser._id;

    useEffect(() => {
        dispatch(getAllSclasses(school, "Sclass"));
    }, [dispatch, school]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(getClassStudents(selectedClass._id));
        }
    }, [dispatch, selectedClass]);

    const submitHandler = (event) => {
        event.preventDefault();
        if (!studentId) {
            setMessage("Please select a student (child)");
            setShowPopup(true);
            return;
        }
        setLoader(true);
        const fields = { name, email, password, role, school, studentId };
        dispatch(registerUser(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/students");
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 5, 
                    borderRadius: 4, 
                    border: '1px solid #e0e0e0',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.05)' 
                }}
            >
                <form onSubmit={submitHandler}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
                            Add Parent
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Create a new parent account linked to a student.
                        </Typography>
                    </Box>

                    {/* Step 1 & 2: Relationship Section */}
                    <Box sx={{ bgcolor: '#f8f9fa', p: 3, borderRadius: 3, mb: 4 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChildCareIcon fontSize="small" color="primary" /> Student Relationship
                        </Typography>
                        
                        <Autocomplete
                            options={sclassesList || []}
                            getOptionLabel={(option) => option.sclassName || ""}
                            onChange={(e, value) => {
                                setSelectedClass(value);
                                setStudentId("");
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Class" variant="standard" fullWidth required />
                            )}
                            sx={{ mb: 3 }}
                        />

                        <Autocomplete
                            disabled={!selectedClass}
                            options={sclassStudents || []}
                            getOptionLabel={(option) => `${option.name} (Roll: ${option.rollNum})`}
                            onChange={(e, value) => setStudentId(value?._id || "")}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label={selectedClass ? "Select Child" : "Waiting for class selection..."} 
                                    variant="standard" 
                                    fullWidth 
                                    required 
                                />
                            )}
                        />
                    </Box>

                    <Divider sx={{ mb: 4 }}>
                        <Typography variant="caption" sx={{ px: 2, color: 'text.disabled', fontWeight: 'bold' }}>
                            ACCOUNT DETAILS
                        </Typography>
                    </Divider>

                    {/* Step 3: Account Details */}
                    <Stack spacing={3}>
                        <TextField 
                            label="Parent Full Name" 
                            fullWidth 
                            variant="outlined"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField 
                            label="Email Address" 
                            type="email"
                            fullWidth 
                            variant="outlined"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField 
                            label="Security Password" 
                            type="password"
                            fullWidth 
                            variant="outlined"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Stack>

                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        disabled={loader}
                        size="large"
                        sx={{ 
                            mt: 4, 
                            py: 1.8, 
                            borderRadius: 2, 
                            fontSize: '1rem', 
                            fontWeight: 'bold',
                            boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)'
                        }}
                    >
                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Create Parent Account'}
                    </Button>
                </form>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

// Simple Stack component polyfill if not imported
const Stack = ({ children, spacing }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>{children}</Box>
);

export default AddParent;