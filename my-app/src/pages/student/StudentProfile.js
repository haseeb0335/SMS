import React, { useEffect } from 'react';
import {
    Card, CardContent, Typography, Grid, Box, Avatar,
    Container, Paper, Divider, Stack, Chip, CircularProgress,
    alpha
} from '@mui/material';
import {
    Email,
    Phone,
    Home,
    Cake,
    Transgender,
    Badge,
    ContactPhone,
    School
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentProfile } from '../../redux/userRelated/userHandle';

const StudentProfile = () => {
    const dispatch = useDispatch();
    const { currentUser, studentProfile, loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getStudentProfile(currentUser._id));
        }
    }, [dispatch, currentUser]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="h6" color="error" align="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    if (!studentProfile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Typography variant="h6" color="textSecondary">Fetching student data...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Header Section */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar 
                            sx={{ 
                                width: 100, 
                                height: 100, 
                                fontSize: '2.5rem', 
                                bgcolor: alpha('#fff', 0.2),
                                border: '4px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}
                        >
                            {studentProfile?.name?.charAt(0)}
                        </Avatar>
                    </Grid>
                    <Grid item xs={12} sm>
                        <Typography variant="h4" fontWeight="700" gutterBottom>
                            {studentProfile?.name}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip 
                                icon={<Badge sx={{ color: 'white !important' }} />} 
                                label={`Roll: ${studentProfile?.rollNum}`} 
                                sx={{ bgcolor: alpha('#fff', 0.15), color: 'white', fontWeight: 500 }}
                            />
                            <Chip 
                                icon={<School sx={{ color: 'white !important' }} />} 
                                label={studentProfile?.sclassName?.sclassName} 
                                sx={{ bgcolor: alpha('#fff', 0.15), color: 'white', fontWeight: 500 }}
                            />
                        </Stack>
                        <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
                            {studentProfile?.school?.schoolName}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Information Section */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Personal Information
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    
                    <Grid container spacing={4}>
                        <InfoBox icon={<Email color="primary" />} label="Email Address" value={studentProfile?.email} />
                        <InfoBox icon={<Phone color="primary" />} label="Phone Number" value={studentProfile?.phone} />
                        <InfoBox icon={<Cake color="primary" />} label="Date of Birth" value={studentProfile?.dob} />
                        <InfoBox icon={<Transgender color="primary" />} label="Gender" value={studentProfile?.gender} />
                        <InfoBox icon={<ContactPhone color="primary" />} label="Emergency Contact" value={studentProfile?.emergencyContact} />
                        <InfoBox icon={<Home color="primary" />} label="Home Address" value={studentProfile?.address} fullWidth />
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

// Helper component for clean layout
const InfoBox = ({ icon, label, value, fullWidth = false }) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#1976d2', 0.05),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                    {value || "Not Provided"}
                </Typography>
            </Box>
        </Stack>
    </Grid>
);

export default StudentProfile;