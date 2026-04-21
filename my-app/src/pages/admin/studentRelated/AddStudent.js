import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { 
    CircularProgress, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Grid, 
    Avatar, 
    MenuItem, 
    IconButton,
    Divider
} from '@mui/material';
import { CloudUpload, PersonAdd } from '@mui/icons-material';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');

    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [email, setEmail] = useState('');
    
    const [profilePic, setProfilePic] = useState('');
    const [preview, setPreview] = useState(null);

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

    const fields = {
        name, fatherName, rollNum, password, sclassName, adminID,
        role, attendance, phone, dob, gender, address, emergencyContact, email, profilePic
    };

    const submitHandler = (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        } else {
            setLoader(true)
            dispatch(registerUser(fields, role))
        }
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            navigate(-1)
        } else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        } else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 900, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <PersonAdd color="primary" fontSize="large" />
                    <Typography variant="h5" fontWeight="700">
                        Registration: Add New Student
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 4 }} />

                <form onSubmit={submitHandler}>
                    <Grid container spacing={3}>
                        {/* Profile Pic Section */}
                        <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 2 }}>
                            <Avatar 
                                src={preview} 
                                sx={{ width: 100, height: 100, mb: 2, border: '2px solid #1976d2' }} 
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                size="small"
                            >
                                Upload Photo
                                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Student Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Father's Name" variant="outlined" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
                        </Grid>

                        {situation === "Student" && (
                            <Grid item xs={12}>
                                <TextField 
                                    select fullWidth label="Class" value={className} onChange={changeHandler} required
                                >
                                    <MenuItem value="Select Class">Select Class</MenuItem>
                                    {sclassesList.map((classItem, index) => (
                                        <MenuItem key={index} value={classItem.sclassName}>{classItem.sclassName}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Roll Number" variant="outlined" value={rollNum} onChange={(e) => setRollNum(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="email" label="Email Address" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" variant="outlined" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Emergency Contact" variant="outlined" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={dob} onChange={(e) => setDob(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                <MenuItem value="">Select Gender</MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Home Address" variant="outlined" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type="password" label="Password" variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Grid>

                        <Grid item xs={12}>
                            <Button 
                                type="submit" 
                                fullWidth 
                                variant="contained" 
                                size="large" 
                                disabled={loader}
                                sx={{ py: 1.5, mt: 2, borderRadius: 2, fontWeight: 'bold' }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Register Student'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
}

export default AddStudent;