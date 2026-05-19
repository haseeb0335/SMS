import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
  Typography,
} from '@mui/material';
import { AccountCircle, School, Group, FamilyRestroom } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Adminlogin');
      }
    } else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Dipesh Awasthi";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Studentlogin');
      }
    } else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Teacherlogin');
      }
    } else if (user === "Parent") {
      if (visitor === "guest") {
        const email = "parent@example.com";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Parentlogin');
      }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      } else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      } else if (currentRole === 'Parent') {
        navigate('/Parent/dashboard');
      }
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledWrapperContainer>
      <Container maxWidth="lg">
        <HeaderSectionBox>
          <Typography className="title-text">Welcome to School System</Typography>
          <Typography className="subtitle-text">Please select your user type to continue</Typography>
        </HeaderSectionBox>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {/* Admin Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledActionPaper elevation={0} onClick={() => navigateHandler("Admin")}>
              <Box className="icon-wrapper">
                <AccountCircle />
              </Box>
              <Typography variant="h5" className="card-heading">Admin</Typography>
              <Typography className="card-description">
                Manage school data, staff, and overall system configuration.
              </Typography>
            </StyledActionPaper>
          </Grid>

          {/* Student Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledActionPaper elevation={0} onClick={() => navigateHandler("Student")}>
              <Box className="icon-wrapper">
                <School />
              </Box>
              <Typography variant="h5" className="card-heading">Student</Typography>
              <Typography className="card-description">
                Access your courses, view assignments, and track your grades.
              </Typography>
            </StyledActionPaper>
          </Grid>

          {/* Teacher Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledActionPaper elevation={0} onClick={() => navigateHandler("Teacher")}>
              <Box className="icon-wrapper">
                <Group />
              </Box>
              <Typography variant="h5" className="card-heading">Teacher</Typography>
              <Typography className="card-description">
                Manage your classes, mark attendance, and upload materials.
              </Typography>
            </StyledActionPaper>
          </Grid>

          {/* Parent Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledActionPaper elevation={0} onClick={() => navigateHandler("Parent")}>
              <Box className="icon-wrapper">
                <FamilyRestroom />
              </Box>
              <Typography variant="h5" className="card-heading">Parent</Typography>
              <Typography className="card-description">
                Monitor your child's academic progress and attendance reports.
              </Typography>
            </StyledActionPaper>
          </Grid>
        </Grid>
      </Container>

      <Backdrop
        sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(2, 6, 23, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}
        open={loader}
      >
        <CircularProgress color="primary" thickness={4.5} size={50} sx={{ color: '#7c3aed' }} />
        <Typography variant="h6" sx={{ letterSpacing: '0.5px', fontWeight: 600 }}>Authenticating...</Typography>
      </Backdrop>
      
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledWrapperContainer>
  );
};

export default ChooseUser;

/* --- MODERN SYSTEM NATIVE HOISTED CORE ARCHITECTURE OVERRIDES --- */

const StyledWrapperContainer = styled(Box)(({ theme }) => ({
  background: 'radial-gradient(circle at 50% 10%, #1e1b4b 0%, #020617 100%)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem 2rem',
  [theme.breakpoints.down('sm')]: {
    padding: '2.5rem 1.25rem',
  },
}));

const HeaderSectionBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: '4rem',
  [theme.breakpoints.down('sm')]: {
    marginBottom: '2.5rem',
  },
  '& .title-text': {
    color: '#ffffff',
    fontSize: '2.75rem',
    fontWeight: 900,
    letterSpacing: '-1px',
    lineHeight: 1.2,
    marginBottom: '0.75rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  '& .subtitle-text': {
    color: '#94a3b8',
    fontSize: '1.15rem',
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
}));

const StyledActionPaper = styled(Paper)(({ theme }) => ({
  padding: '40px 24px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.02) !important',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08) !important',
  borderRadius: '28px !important',
  color: '#ffffff !important',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important',

  [theme.breakpoints.down('sm')]: {
    padding: '32px 20px',
  },

  '&:hover': {
    background: 'rgba(255, 255, 255, 0.06) !important',
    transform: 'translateY(-8px)',
    borderColor: 'rgba(124, 58, 237, 0.6) !important',
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 40px 2px rgba(124, 58, 237, 0.15) !important',

    '& .icon-wrapper': {
      backgroundColor: '#7c3aed',
      color: '#ffffff',
      boxShadow: '0 0 20px 4px rgba(124, 58, 237, 0.4)',
      transform: 'scale(1.05) rotate(4deg)',
    },
  },

  '& .icon-wrapper': {
    width: '76px',
    height: '76px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: '#a78bfa',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',

    '& svg': {
      fontSize: '2.5rem',
    },
  },

  '& .card-heading': {
    marginBottom: '12px',
    fontSize: '1.45rem',
    fontWeight: 800,
    letterSpacing: '-0.2px',
    color: '#f8fafc',
  },

  '& .card-description': {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    fontWeight: 500,
  },
}));