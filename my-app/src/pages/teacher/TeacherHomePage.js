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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper variant="outlined">
                        <IconBox src={Students} alt="Students" />
                        <Box>
                            <CardTitle>Class Students</CardTitle>
                            <CountText sx={{ color: '#1976d2' }}>
                                {numberOfStudents}
                            </CountText>
                        </Box>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper variant="outlined">
                        <IconBox src={Lessons} alt="Lessons" />
                        <Box>
                            <CardTitle>Total Lessons</CardTitle>
                            <CountText sx={{ color: '#2e7d32' }}>
                                {numberOfSessions}
                            </CountText>
                        </Box>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper variant="outlined">
                        <IconBox src={Tests} alt="Tests" />
                        <Box>
                            <CardTitle>Tests Taken</CardTitle>
                            <CountText sx={{ color: '#ed6c02' }}>
                                24
                            </CountText>
                        </Box>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StyledPaper variant="outlined">
                        <IconBox src={Time} alt="Time" />
                        <Box>
                            <CardTitle>Total Hours</CardTitle>
                            <CountText sx={{ color: '#9c27b0' }}>
                                30 hrs
                            </CountText>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Notice Section */}
                <Grid item xs={12}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: { xs: 2, md: 3 }, 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="800">Recent Notices</Typography>
                        </Stack>
                        <SeeNotice />
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    )
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '220px',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: '24px',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
        borderColor: theme.palette.primary.main,
    },
}));

const IconBox = styled('img')({
    width: '70px',
    height: '70px',
    objectFit: 'contain',
});

const CardTitle = styled(Typography)({
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
});

const CountText = styled(Typography)({
    fontSize: '2.2rem',
    fontWeight: 900,
    lineHeight: 1,
    marginTop: '4px'
});

export default TeacherHomePage;