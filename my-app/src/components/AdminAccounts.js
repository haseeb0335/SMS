import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, List, ListItemButton, ListItemText, ListItemIcon, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const AdminAccounts = () => {
    const [selectedSection, setSelectedSection] = useState(null); // null, 'fees', 'expense', 'salary', 'others'

    const renderFeesMenu = () => (
        <Box sx={{ mt: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedSection(null)} sx={{ mb: 2 }}>
                Back to Accounts
            </Button>
            <Typography variant="h5" gutterBottom>Fee Management</Typography>
            <Paper elevation={3}>
                <List>
                    <ListItemButton component={Link} to="/Admin/showfees">
                        <ListItemText primary="Student fee collections " />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/Admin/fees/admission">
                        <ListItemText primary="Admission fees" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/Admin/fees/exam">
                        <ListItemText primary="Exam fees" />
                    </ListItemButton>
                    <Divider />
                     <ListItemButton component={Link} to="/Admin/fees">
                        <ListItemText primary="Add New Month Fee" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/Admin/fees/income">
                        <ListItemText primary="Other income (donations, fines)" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/Admin/fees/structure">
                        <ListItemText primary="Assign fee structure per class" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/fee-tracker">
                        <ListItemText primary="Track paid/unpaid students" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton component={Link} to="/Admin/fees/due-dates">
                        <ListItemText primary="Due dates & late fines" />
                    </ListItemButton>
                    <Divider />
                  
                  
                </List>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            {!selectedSection ? (
                <>
                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>School Accounts</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper onClick={() => setSelectedSection('fees')} sx={cardStyle}>
                                <PaymentsIcon sx={{ fontSize: 50, color: '#1976d2' }} />
                                <Typography variant="h6">Fees</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper component={Link} to="/Admin/expenses" sx={{...cardStyle, textDecoration: 'none', color: 'inherit'}}>
                                <MoneyOffIcon sx={{ fontSize: 50, color: '#d32f2f' }} />
                                <Typography variant="h6">Expenses</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper component={Link} to="/Admin/teacher-salary" sx={{...cardStyle, textDecoration: 'none', color: 'inherit'}}>
                                <WorkHistoryIcon sx={{ fontSize: 50, color: '#2e7d32' }} />
                                <Typography variant="h6">Salaries</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={cardStyle}>
                                <AccountBalanceIcon sx={{ fontSize: 50, color: '#ed6c02' }} />
                                <Typography variant="h6">Others</Typography>
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

const cardStyle = {
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    cursor: 'pointer',
    transition: '0.3s',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6, bgcolor: '#f0f7ff' }
};

export default AdminAccounts;