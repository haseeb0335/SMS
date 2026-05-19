import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Button, Grid, Box, Typography, Paper, Checkbox, 
    FormControlLabel, TextField, CssBaseline, IconButton, 
    InputAdornment, CircularProgress, Backdrop 
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { LightPurpleButton } from '../components/buttonStyles';
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
                <StyledPaper elevation={0}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconCircle>
                            <LockOutlined />
                        </IconCircle>
                        <Typography variant="h4" className="login-title">
                            {role} Login
                        </Typography>
                        <Typography variant="body2" className="login-subtitle">
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
                                        className="form-input-field"
                                    />
                                    <TextField
                                        margin="normal" required fullWidth name="studentName"
                                        label="Student Name" id="studentName"
                                        error={studentNameError} helperText={studentNameError && 'Required'}
                                        onChange={handleInputChange}
                                        className="form-input-field"
                                    />
                                </>
                            ) : (
                                <TextField
                                    margin="normal" required fullWidth id="email"
                                    label="Email Address" name="email" autoComplete="email"
                                    error={emailError} helperText={emailError && 'Required'}
                                    onChange={handleInputChange}
                                    className="form-input-field"
                                />
                            )}
                            <TextField
                                margin="normal" required fullWidth name="password"
                                label="Password" type={toggle ? 'text' : 'password'}
                                id="password" error={passwordError}
                                helperText={passwordError && 'Required'}
                                onChange={handleInputChange}
                                className="form-input-field"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setToggle(!toggle)} edge="end">
                                                {toggle ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5, mb: 1 }}>
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" sx={{ borderRadius: '4px' }} />}
                                    label={<Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>Remember me</Typography>}
                                />
                                <StyledLink to="#">Forgot password?</StyledLink>
                            </Box>

                            <LightPurpleButton
                                type="submit" fullWidth variant="contained"
                                sx={{ mt: 3, py: 1.75, fontSize: '1rem', fontWeight: 700, borderRadius: '14px', textTransform: 'none', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.25)' }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Login"}
                            </LightPurpleButton>

                            <Button
                                fullWidth onClick={guestModeHandler} variant="outlined"
                                sx={{ mt: 2, py: 1.75, color: "#7c3aed", borderColor: "#e2e8f0", fontWeight: '700', borderRadius: '14px', textTransform: 'none', '&:hover': { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' } }}
                            >
                                Login as Guest
                            </Button>

                            {role === "Admin" && (
                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Don't have an account?{' '}
                                        <Link to="/Adminregister" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
                                            Sign up
                                        </Link>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </StyledPaper>

                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)' }}
                    open={guestLoader}
                >
                    <CircularProgress color="primary" thickness={4.5} size={48} sx={{ color: '#7c3aed' }} />
                    <Typography sx={{ fontWeight: 600, letterSpacing: '0.2px' }}>Authenticating Guest Profile...</Typography>
                </Backdrop>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </StyledMainContainer>
        </ThemeProvider>
    );
};

export default LoginPage;

/* --- COMPONENT STYLING SYSTEM --- */

const StyledMainContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  [theme.breakpoints.down('sm')]: {
    padding: '0px', // Erases external padding fields entirely on micro-displays
    backgroundColor: '#ffffff',
    background: '#ffffff',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '48px 40px',
  width: '100%',
  maxWidth: '460px',
  borderRadius: '28px !important',
  background: '#ffffff !important',
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08) !important',
  border: '1px solid #f1f5f9',
  
  [theme.breakpoints.down('sm')]: {
    padding: '36px 24px',
    borderRadius: '0px !important', // Converts to clean full-screen sheet format on mobile devices
    boxShadow: 'none !important',
    border: 'none',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
  },

  '& .login-title': {
    fontWeight: 900, 
    color: '#0f172a', 
    marginBottom: '6px',
    letterSpacing: '-0.5px',
    fontSize: '1.875rem',
  },

  '& .login-subtitle': {
    color: '#64748b', 
    marginBottom: '28px',
    fontWeight: 500,
  },

  '& .form-input-field': {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: '#e2e8f0' },
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
    }
  }
}));

const IconCircle = styled(Box)(() => ({
  width: '56px',
  height: '56px',
  backgroundColor: '#f5f3ff',
  color: '#7c3aed',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: 'none',
  color: '#7c3aed',
  fontSize: '0.875rem',
  fontWeight: 700,
  '&:hover': {
    textDecoration: 'underline',
  },
}));