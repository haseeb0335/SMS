import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Box, Button } from '@mui/material';
import styled from 'styled-components';
import Students from "../assets/students.svg";
import { LightPurpleButton } from '../components/buttonStyles';

const Homepage = () => {
    return (
        <StyledContainer>
            <Container maxWidth="lg">
                <Grid 
                    container 
                    spacing={0} 
                    alignItems="center" 
                    justifyContent="center"
                    sx={{ flexDirection: { xs: "column-reverse", md: "row" }, minHeight: '100vh' }}
                >
                    <Grid item xs={12} md={6}>
                        <StyledContentBox>
                            <StyledTitle>
                                Elevate Your <br />
                                <span>School System</span>
                            </StyledTitle>
                            <StyledText>
                                Streamline school management, class organization, and add students and faculty.
                                Seamlessly track attendance, assess performance, and provide feedback.
                            </StyledText>
                            <StyledActionBox>
                                <StyledLink to="/choose">
                                    <LightPurpleButton variant="contained" fullWidth sx={{ py: 2, fontSize: '1rem', fontWeight: '700' }}>
                                        Login
                                    </LightPurpleButton>
                                </StyledLink>
                                <StyledLink to="/chooseasguest">
                                    <Button 
                                        variant="outlined" 
                                        fullWidth
                                        sx={{ 
                                            py: 2, 
                                            fontSize: '1rem', 
                                            color: "#7c3aed", 
                                            borderColor: "#7c3aed",
                                            borderWidth: '2px',
                                            '&:hover': { 
                                                borderWidth: '2px', 
                                                borderColor: '#5b21b6', 
                                                backgroundColor: 'rgba(124, 58, 237, 0.05)' 
                                            } 
                                        }}
                                    >
                                        Login as Guest
                                    </Button>
                                </StyledLink>
                                <SignupText>
                                    Don't have an account?{' '}
                                    <Link to="/Adminregister" className="signup-link">
                                        Sign up
                                    </Link>
                                </SignupText>
                            </StyledActionBox>
                        </StyledContentBox>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 0 } }}>
                        <HeroImage src={Students} alt="students" />
                    </Grid>
                </Grid>
            </Container>
        </StyledContainer>
    );
};

export default Homepage;

/* --- LIGHT MODERN & MOBILE FRIENDLY STYLES --- */

const StyledContainer = styled.div`
  /* Light, soft professional background */
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  padding: 20px 0;
`;

const StyledContentBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;

  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
  }
`;

const StyledTitle = styled.h1`
  font-size: clamp(2.2rem, 5vw, 4rem);
  color: #1e293b; /* Deep Navy/Slate for high contrast on light bg */
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -1.5px;

  span {
    color: #7c3aed; /* Strong Purple */
  }
`;

const StyledText = styled.p`
  color: #475569; /* Medium Slate for readability */
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 500px;
  height: auto;
  /* Shadow is more important on light backgrounds to create depth */
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15));
  
  @media (max-width: 600px) {
    max-width: 280px;
  }
`;

const StyledActionBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const SignupText = styled.p`
  margin-top: 20px;
  color: #64748b;
  font-size: 0.95rem;

  .signup-link {
    color: #7c3aed;
    font-weight: 700;
    text-decoration: none;
    transition: 0.3s;

    &:hover {
      color: #5b21b6;
      text-decoration: underline;
    }
  }
`;