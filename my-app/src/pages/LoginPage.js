import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Button, Grid, Box, Typography, Paper, Checkbox, 
    FormControlLabel, TextField, CssBaseline, IconButton, 
    InputAdornment, CircularProgress, Backdrop 
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { LightPurpleButton } from '../components/buttonStyles';
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#7c3aed',
        },
    },
});

const LoginPage = ({ role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false);
    const [guestLoader, setGuestLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (role === "Student") {
            const rollNum = event.target.rollNumber.value;
            const studentName = event.target.studentName.value;
            const password = event.target.password.value;

            if (!rollNum || !studentName || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!studentName) setStudentNameError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { rollNum, studentName, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }

            const fields = { email, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    const guestModeHandler = () => {
        const password = "zxc";
        if (role === "Admin") {
            const email = "yogendra@12";
            const fields = { email, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        } else if (role === "Student") {
            const rollNum = "1";
            const studentName = "Dipesh Awasthi";
            const fields = { rollNum, studentName, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        } else if (role === "Teacher") {
            const email = "tony@12";
            const fields = { email, password };
            setGuestLoader(true);
            dispatch(loginUser(fields, role));
        }
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') navigate('/Admin/dashboard');
            else if (currentRole === 'Student') navigate('/Student/dashboard');
            else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
            setGuestLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
            setGuestLoader(false);
        }
    }, [status, currentRole, navigate, response, currentUser]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <StyledMainContainer>
                <CssBaseline />
                <StyledPaper elevation={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconCircle>
                            <LockOutlined />
                        </IconCircle>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 1 }}>
                            {role} Login
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                            Welcome back! Please enter your details.
                        </Typography>

                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
                            {role === "Student" ? (
                                <>
                                    <TextField
                                        margin="normal" required fullWidth name="rollNumber"
                                        label="Roll Number" type="number" id="rollNumber"
                                        error={rollNumberError} helperText={rollNumberError && 'Required'}
                                        onChange={handleInputChange}
                                    />
                                    <TextField
                                        margin="normal" required fullWidth name="studentName"
                                        label="Student Name" id="studentName"
                                        error={studentNameError} helperText={studentNameError && 'Required'}
                                        onChange={handleInputChange}
                                    />
                                </>
                            ) : (
                                <TextField
                                    margin="normal" required fullWidth id="email"
                                    label="Email Address" name="email" autoComplete="email"
                                    error={emailError} helperText={emailError && 'Required'}
                                    onChange={handleInputChange}
                                />
                            )}
                            <TextField
                                margin="normal" required fullWidth name="password"
                                label="Password" type={toggle ? 'text' : 'password'}
                                id="password" error={passwordError}
                                helperText={passwordError && 'Required'}
                                onChange={handleInputChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)}>
                                                {toggle ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label={<Typography variant="body2">Remember me</Typography>}
                                />
                                <StyledLink to="#">Forgot password?</StyledLink>
                            </Box>

                            <LightPurpleButton
                                type="submit" fullWidth variant="contained"
                                sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Login"}
                            </LightPurpleButton>

                            <Button
                                fullWidth onClick={guestModeHandler} variant="outlined"
                                sx={{ mt: 2, py: 1.5, color: "#7c3aed", borderColor: "#7c3aed", fontWeight: '600' }}
                            >
                                Login as Guest
                            </Button>

                            {role === "Admin" && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Don't have an account?{' '}
                                        <Link to="/Adminregister" style={{ color: '#7c3aed', fontWeight: 'bold', textDecoration: 'none' }}>
                                            Sign up
                                        </Link>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </StyledPaper>

                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2 }}
                    open={guestLoader}
                >
                    <CircularProgress color="inherit" />
                    <Typography>Authenticating Guest...</Typography>
                </Backdrop>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </StyledMainContainer>
        </ThemeProvider>
    );
};

export default LoginPage;

/* --- STYLES --- */

const StyledMainContainer = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const StyledPaper = styled(Paper)`
  padding: 40px;
  width: 100%;
  max-width: 450px;
  border-radius: 24px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
`;

const IconCircle = styled.div`
  width: 50px;
  height: 50px;
  background-color: #7c3aed;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #7c3aed;
  font-size: 0.875rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

