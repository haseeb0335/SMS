import React from 'react';
import { useSelector } from 'react-redux';
import { 
    Box, Paper, Typography, Avatar, Grid, 
    Divider, Card, CardContent 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SchoolIcon from '@mui/icons-material/School';
import styled from 'styled-components';

const ParentProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                My Profile
            </Typography>
            
            <Grid container spacing={3}>
                {/* Parent Information Card */}
                <Grid item xs={12} md={5}>
                    <StyledPaper elevation={3}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
                                <PersonIcon sx={{ fontSize: 50 }} />
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold">{currentUser.name}</Typography>
                            <Typography color="textSecondary">Registered Parent</Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <EmailIcon color="action" />
                            <Box>
                                <Typography variant="caption" color="textSecondary">Email Address</Typography>
                                <Typography variant="body1">{currentUser.email}</Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" gap={2}>
                            <SchoolIcon color="action" />
                            <Box>
                                <Typography variant="caption" color="textSecondary">School ID</Typography>
                                <Typography variant="body1">{currentUser.school}</Typography>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Linked Student Card */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: '15px', height: '100%' }} elevation={3}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <ChildCareIcon color="secondary" />
                                <Typography variant="h6" fontWeight="bold">Linked Child Details</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            
                            <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: '10px' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="textSecondary">Student Database ID</Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {currentUser.studentId}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="textSecondary">Account Status</Typography>
                                        <Typography variant="body1" color="green" fontWeight="bold">
                                            Active
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            
                            <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', color: 'gray' }}>
                                * If the linked student information is incorrect, please contact the school administrator to update your account link.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentProfile;

const StyledPaper = styled(Paper)`
  padding: 30px;
  border-radius: 15px;
  height: 100%;
`;