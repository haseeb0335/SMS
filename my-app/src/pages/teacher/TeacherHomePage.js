import { Container, Grid, Paper, Typography, Box, Stack } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { styled } from '@mui/material/styles';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const TeacherHomePage = () => {

    const dispatch = useDispatch();

    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubject?._id;

    useEffect(() => {
        if (subjectID) {
            dispatch(getSubjectDetails(subjectID, "Subject"));
        }
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, subjectID, classID]);

    const numberOfStudents = sclassStudents?.length || 0;
    const numberOfSessions = subjectDetails?.sessions || 0;

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 3 } }}>
            <Grid container spacing={{ xs: 0, md: 3 }}>
                
                {/* DIV WRAPPER 1: Only flexes side-by-side on Mobile viewports */}
                <MobileResponsiveWrapper>
                    {/* Class Students Card */}
                    <Grid item xs={6} md={3} className="grid-item-mod">
                        <StyledPaper variant="outlined">
                            <IconBox src={Students} alt="Students" />
                            <Box className="card-content-wrapper">
                                <CardTitle>Class Students</CardTitle>
                                <CountText sx={{ color: '#2563eb' }}>
                                    {numberOfStudents}
                                </CountText>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    {/* Total Lessons Card */}
                    <Grid item xs={6} md={3} className="grid-item-mod">
                        <StyledPaper variant="outlined">
                            <IconBox src={Lessons} alt="Lessons" />
                            <Box className="card-content-wrapper">
                                <CardTitle>Total Lessons</CardTitle>
                                <CountText sx={{ color: '#16a34a' }}>
                                    {numberOfSessions}
                                </CountText>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </MobileResponsiveWrapper>

                {/* DIV WRAPPER 2: Only flexes side-by-side on Mobile viewports */}
                <MobileResponsiveWrapper>
                    {/* Tests Taken Card */}
                    <Grid item xs={6} md={3} className="grid-item-mod">
                        <StyledPaper variant="outlined">
                            <IconBox src={Tests} alt="Tests" />
                            <Box className="card-content-wrapper">
                                <CardTitle>Tests Taken</CardTitle>
                                <CountText sx={{ color: '#ea580c' }}>
                                    24
                                </CountText>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    {/* Total Hours Card */}
                    <Grid item xs={6} md={3} className="grid-item-mod">
                        <StyledPaper variant="outlined">
                            <IconBox src={Time} alt="Time" />
                            <Box className="card-content-wrapper">
                                <CardTitle>Total Hours</CardTitle>
                                <CountText sx={{ color: '#9333ea' }}>
                                    30 hrs
                                </CountText>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </MobileResponsiveWrapper>

                {/* Notice Section */}
                <Grid item xs={12} sx={{ mt: { xs: 1.5, sm: 0 } }}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: { xs: 2, sm: 3, md: 4 }, 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: '24px',
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.03)'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                Recent Notices
                            </Typography>
                        </Stack>
                        <SeeNotice />
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    )
}

/* --- ADAPTIVE ARCHITECTURE VIEW OVERRIDES --- */

const MobileResponsiveWrapper = styled(Box)(({ theme }) => ({
  // Acts completely transparent on Desktop view so layout structures remain intact
  display: 'contents', 

  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: '12px',               // Controlled padding between the two mobile items
    marginBottom: '12px',      // Vertical spacing separating rows 1 and 2
    
    '& .grid-item-mod': {
      width: '50%',
      padding: '0 !important', // Strips parent overrides out on small screen views
    }
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '220px',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '24px',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    width: '100%',
    
    [theme.breakpoints.down('sm')]: {
        height: 'auto',
        minHeight: '145px',
        padding: '16px 8px',
        justifyContent: 'center',
        gap: '8px',
    },
    
    '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
        borderColor: '#7c3aed',
    },

    '& .card-content-wrapper': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }
}));

const IconBox = styled('img')(({ theme }) => ({
    width: '70px',
    height: '70px',
    objectFit: 'contain',
    transition: 'all 0.3s ease',
    [theme.breakpoints.down('sm')]: {
        width: '42px',
        height: '42px',
    },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.68rem',
        letterSpacing: '0.1px',
        lineHeight: 1.2,
    },
}));

const CountText = styled(Typography)(({ theme }) => ({
    fontSize: '2.2rem',
    fontWeight: 900,
    lineHeight: 1,
    marginTop: '4px',
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.35rem',
        fontWeight: 800,
        marginTop: '2px',
    },
}));

export default TeacherHomePage;