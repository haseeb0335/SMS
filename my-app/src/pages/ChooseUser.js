import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import styled from 'styled-components';
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
    <StyledContainer>
      <Container maxWidth="lg">
        <HeaderSection>
          <Title>Welcome to School System</Title>
          <Subtitle>Please select your user type to continue</Subtitle>
        </HeaderSection>

        <Grid container spacing={4} justifyContent="center">
          {/* Admin Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={0} onClick={() => navigateHandler("Admin")}>
              <Box className="icon-wrapper">
                <AccountCircle />
              </Box>
              <StyledTypography>Admin</StyledTypography>
              <Description>
                Manage school data, staff, and overall system configuration.
              </Description>
            </StyledPaper>
          </Grid>

          {/* Student Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={0} onClick={() => navigateHandler("Student")}>
              <Box className="icon-wrapper">
                <School />
              </Box>
              <StyledTypography>Student</StyledTypography>
              <Description>
                Access your courses, view assignments, and track your grades.
              </Description>
            </StyledPaper>
          </Grid>

          {/* Teacher Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={0} onClick={() => navigateHandler("Teacher")}>
              <Box className="icon-wrapper">
                <Group />
              </Box>
              <StyledTypography>Teacher</StyledTypography>
              <Description>
                Manage your classes, mark attendance, and upload materials.
              </Description>
            </StyledPaper>
          </Grid>

          {/* Parent Card */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={0} onClick={() => navigateHandler("Parent")}>
              <Box className="icon-wrapper">
                <FamilyRestroom />
              </Box>
              <StyledTypography>Parent</StyledTypography>
              <Description>
                Monitor your child's academic progress and attendance reports.
              </Description>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>

      <Backdrop
        sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}
        open={loader}
      >
        <CircularProgress color="inherit" thickness={4} size={50} />
        <Typography variant="h6" sx={{ letterSpacing: '1px' }}>Authenticating...</Typography>
      </Backdrop>
      
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

/* --- MODERN STYLES --- */

const StyledContainer = styled.div`
  background: radial-gradient(circle at 20% 20%, #2e1065 0%, #020617 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
`;

const StyledPaper = styled(Paper)`
  padding: 40px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 24px !important;
  color: #ffffff !important;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;

  &:hover {
    background: rgba(255, 255, 255, 0.07) !important;
    transform: translateY(-12px);
    border-color: #7c3aed !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;

    .icon-wrapper {
      background: #7c3aed;
      transform: rotate(5deg);
    }
  }

  .icon-wrapper {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    transition: all 0.3s ease;

    svg {
      font-size: 2.5rem;
    }
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 12px;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.6;
  font-weight: 400;
`;