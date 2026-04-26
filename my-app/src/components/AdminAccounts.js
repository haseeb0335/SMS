import React, { useState } from 'react';
import { 
    Box, Grid, Paper, Typography, List, ListItemButton, 
    ListItemText, ListItemIcon, Divider, Button, Fade 
} from '@mui/material';
import { Link } from 'react-router-dom';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SavingsIcon from '@mui/icons-material/Savings';

const AdminAccounts = () => {
    const [selectedSection, setSelectedSection] = useState(null);

    const renderFeesMenu = () => (
        <Fade in={true} timeout={500}>
            <Box sx={{ mt: { xs: 1, md: 3 } }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => setSelectedSection(null)} 
                    sx={{ mb: 3, fontWeight: 'bold', borderRadius: '10px' }}
                    variant="outlined"
                >
                    Back to Accounts
                </Button>
                
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: '#1e293b' }}>
                    Fee Management
                </Typography>

                <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <List sx={{ p: 0 }}>
                        {[
                            { text: "Student Fee Collections", to: "/Admin/showfees", icon: <PaymentsIcon color="primary" /> },
                            { text: "Admission Fees", to: "/Admin/fees/admission", icon: <SchoolIcon color="secondary" /> },
                            { text: "Exam Fees", to: "/Admin/fees/exam", icon: <EventNoteIcon color="success" /> },
                            { text: "Add New Month Fee", to: "/Admin/fees", icon: <AddCircleOutlineIcon color="info" /> },
                            { text: "Annual Fund", to: "/Admin/AnnualFund", icon: <SavingsIcon color="warning" /> },
                        ].map((item, index) => (
                            <React.Fragment key={index}>
                                <ListItemButton 
                                    component={Link} 
                                    to={item.to}
                                    sx={{ py: 2, '&:hover': { bgcolor: '#f8fafc' } }}
                                >
                                    <ListItemIcon sx={{ minWidth: 45 }}>{item.icon}</ListItemIcon>
                                    <ListItemText 
                                        primary={item.text} 
                                        primaryTypographyProps={{ fontWeight: 600, color: '#334155' }} 
                                    />
                                    <ChevronRightIcon sx={{ color: '#cbd5e1' }} />
                                </ListItemButton>
                                {index !== 4 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Fade>
    );

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3, md: 5 }, 
            minHeight: '100vh', 
            bgcolor: '#f8fafc' 
        }}>
            {!selectedSection ? (
                <>
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>
                            School Accounts
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
                            Manage fees, expenses, and payroll from a single dashboard.
                        </Typography>
                    </Box>

                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper onClick={() => setSelectedSection('fees')} sx={cardStyle('#3b82f6')}>
                                <Box sx={iconWrapperStyle('#eff6ff')}>
                                    <PaymentsIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Fees</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper component={Link} to="/Admin/expenses" sx={{ ...cardStyle('#ef4444'), textDecoration: 'none', color: 'inherit' }}>
                                <Box sx={iconWrapperStyle('#fef2f2')}>
                                    <MoneyOffIcon sx={{ fontSize: 32, color: '#ef4444' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Expenses</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper component={Link} to="/Admin/teacher-salary" sx={{ ...cardStyle('#22c55e'), textDecoration: 'none', color: 'inherit' }}>
                                <Box sx={iconWrapperStyle('#f0fdf4')}>
                                    <WorkHistoryIcon sx={{ fontSize: 32, color: '#22c55e' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Salaries</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={cardStyle('#f59e0b')}>
                                <Box sx={iconWrapperStyle('#fffbeb')}>
                                    <AccountBalanceIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Others</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                selectedSection === 'fees' && renderFeesMenu()
            )}
        </Box>
    );
};

// Modern dynamic card styles
const cardStyle = (color) => ({
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.5,
    cursor: 'pointer',
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    background: '#ffffff',
    '&:hover': { 
        transform: 'translateY(-8px)', 
        boxShadow: `0 20px 25px -5px ${color}20, 0 8px 10px -6px ${color}20`,
        borderColor: color,
        '& h6': { color: color }
    }
});

const iconWrapperStyle = (bgColor) => ({
    width: 70,
    height: 70,
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: bgColor,
    mb: 1
});

export default AdminAccounts;