import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography, Box, Stack, Divider, useTheme, Avatar, Chip, Card } from '@mui/material'
import { AccountCircle, Fingerprint, Class as ClassIcon, School as SchoolIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import Subject from "../../assets/subjects.svg";
import Assignment from "../../assets/assignment.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

// Graphics Imports
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    const { userDetails, currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const numberOfSubjects = subjectsList && subjectsList.length;
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const attendanceData = [
        { name: 'Goal', percentage: 75, color: '#CBD5E1' },
        { name: 'Current', percentage: overallAttendancePercentage, color: overallAttendancePercentage >= 75 ? '#10B981' : '#F43F5E' },
    ];

    // MOBILE FRIENDLY DETAILS SECTION
    const DetailsSection = () => (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {/* 1. Profile Avatar Card - Full width on mobile, 4-col on md */}
            <Grid item xs={12} md={4} lg={3}>
                <StyledCard sx={{ textAlign: 'center', p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Avatar sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, margin: '0 auto', bgcolor: theme.palette.primary.main, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900 }}>
                        {userDetails?.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#0F172A', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>{userDetails?.name}</Typography>
                    <Chip label="Student Profile" color="primary" size="small" sx={{ mt: 1.5, fontWeight: 700, borderRadius: '8px', alignSelf: 'center' }} />
                </StyledCard>
            </Grid>

            {/* 2. Personal Info List - Full width on mobile, 8-col on md, 5-col on lg */}
            <Grid item xs={12} md={8} lg={5}>
                <StyledCard sx={{ p: 1, height: '100%' }}>
                    <Stack>
                        {[
                            { icon: <AccountCircle color="primary" />, label: 'Full Name', value: userDetails?.name },
                            { icon: <Fingerprint sx={{ color: '#673ab7' }} />, label: 'Roll Number', value: userDetails?.rollNum },
                            { icon: <ClassIcon sx={{ color: '#ff9800' }} />, label: 'Class', value: userDetails?.sclassName?.sclassName },
                            { icon: <SchoolIcon color="info" />, label: 'Institution', value: userDetails?.school?.schoolName }
                        ].map((item, index) => (
                            <Box key={index} sx={{ p: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', borderBottom: index === 3 ? 'none' : '1px solid #f8fafc' }}>
                                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.03)', mr: { xs: 1.5, sm: 2.5 }, width: 36, height: 36 }}>{item.icon}</Avatar>
                                <Box>
                                    <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', fontSize: '0.65rem' }}>{item.label}</Typography>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: '#334155', wordBreak: 'break-word' }}>{item.value || 'Not Assigned'}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </StyledCard>
            </Grid>

            {/* 3. Attendance Graph - Full width on mobile and tablets (md), 4-col on desktop (lg) */}
            <Grid item xs={12} md={12} lg={4}>
                <StyledCard sx={{ p: 3, height: '100%', minHeight: '250px' }}>
                    <Typography variant="subtitle2" fontWeight="900" color="textSecondary" mb={2} sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        Attendance Overview
                    </Typography>
                    <Box sx={{ width: '100%', height: { xs: 150, sm: 180 } }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={false} domain={[0, 100]} />
                                <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="percentage" radius={[6, 6, 6, 6]} barSize={40} background={{ fill: '#f8fafc', radius: 6 }}>
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                    <Stack direction="row" justifyContent="space-between" mt={2}>
                        <Typography variant="caption" fontWeight="700" color="textSecondary">Status:</Typography>
                        <Typography variant="caption" fontWeight="900" color={overallAttendancePercentage >= 75 ? 'success.main' : 'error.main'}>
                            {overallAttendancePercentage >= 75 ? 'ELIGIBLE' : 'LOW ATTENDANCE'}
                        </Typography>
                    </Stack>
                </StyledCard>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ py: { xs: 2, md: 4 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                {/* Profile and Graph Section */}
                <DetailsSection />

                <Grid container spacing={2}>
                    {/* STAT CARDS SECTION */}
                    <Grid item xs={12} sm={6}>
                        <StyledPaper sx={{ p: { xs: 2, md: 3 } }}>
                            <IconBox sx={{ bgcolor: '#DBEAFE', width: { xs: 45, md: 52 }, height: { xs: 45, md: 52 } }}>
                                <img src={Subject} alt="Subjects" style={{ width: '24px' }} />
                            </IconBox>
                            <Box ml={2}>
                                <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem' }}>Subjects</Typography>
                                <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{numberOfSubjects || 0}</Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <StyledPaper sx={{ p: { xs: 2, md: 3 } }}>
                            <IconBox sx={{ bgcolor: '#FEF3C7', width: { xs: 45, md: 52 }, height: { xs: 45, md: 52 } }}>
                                <img src={Assignment} alt="Assignments" style={{ width: '24px' }} />
                            </IconBox>
                            <Box ml={2}>
                                <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.65rem' }}>Tasks</Typography>
                                <Typography variant="h4" fontWeight="900" sx={{ color: '#1E293B', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>15</Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    {/* NOTICE BOARD SECTION */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Box sx={{ width: 4, height: 20, bgcolor: 'primary.main', borderRadius: 1, mr: 1.5 }} />
                                <Typography variant="h6" fontWeight="900" sx={{ color: '#0F172A' }}>Latest Notices</Typography>
                            </Box>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

const StyledPaper = styled(Paper)`
  display: flex;
  align-items: center;
  border-radius: 24px !important;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  background-color: #ffffff !important;
`;

const StyledCard = styled(Card)`
  border-radius: 24px !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
`;

const IconBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
`;

export default StudentHomePage;