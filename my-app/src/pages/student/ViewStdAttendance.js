import React, { useEffect, useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp, DoneAll, EventBusy } from '@mui/icons-material';
import { 
    BottomNavigation, BottomNavigationAction, Box, Button, Collapse, Paper, 
    Table, TableBody, TableHead, Typography, Container, Card, Stack, 
    Chip, CircularProgress, Divider, Fade 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';

import CustomBarChart from '../../components/CustomBarChart'

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const ViewStdAttendance = () => {
    const dispatch = useDispatch();
    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance)
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const subjectData = Object.entries(attendanceBySubject).map(([subName, { subCode, present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => {
        return (
            <Fade in={true}>
                <Box sx={{ mb: 10 }}>
                    {/* Overall Summary Card */}
                    <Card sx={{ p: 3, borderRadius: '24px', mb: 4, textAlign: 'center', border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#fff' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                            <CircularProgress variant="determinate" value={overallAttendancePercentage} size={80} thickness={5} sx={{ color: overallAttendancePercentage >= 75 ? '#10B981' : '#F43F5E' }} />
                            <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" component="div" fontWeight="900" color="text.secondary">{`${Math.round(overallAttendancePercentage)}%`}</Typography>
                            </Box>
                        </Box>
                        <Typography variant="h6" fontWeight="900">Overall Attendance</Typography>
                        <Typography variant="body2" color="textSecondary">Academic Session 2026</Typography>
                    </Card>

                    <Typography variant="h6" fontWeight="900" sx={{ mb: 2, px: 1 }}>Subject Wise Breakdown</Typography>
                    
                    {/* Desktop/Tablet Table */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Table sx={{ bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Subject</StyledTableCell>
                                    <StyledTableCell>Present</StyledTableCell>
                                    <StyledTableCell>Total</StyledTableCell>
                                    <StyledTableCell>Percentage</StyledTableCell>
                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => (
                                <TableBody key={index}>
                                    <StyledTableRow>
                                        <StyledTableCell sx={{ fontWeight: 700 }}>{subName}</StyledTableCell>
                                        <StyledTableCell>{present}</StyledTableCell>
                                        <StyledTableCell>{sessions}</StyledTableCell>
                                        <StyledTableCell>
                                            <Chip label={`${calculateSubjectAttendancePercentage(present, sessions)}%`} size="small" sx={{ fontWeight: 800, bgcolor: '#F1F5F9' }} />
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Button size="small" variant="outlined" onClick={() => handleOpen(subId)} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                                                {openStates[subId] ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />} View Logs
                                            </Button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                        <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                <Box sx={{ p: 2, bgcolor: '#F8FAFC', m: 1, borderRadius: '12px' }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <StyledTableRow>
                                                                <StyledTableCell sx={{ bgcolor: 'transparent', color: '#64748B' }}>Date</StyledTableCell>
                                                                <StyledTableCell align="right" sx={{ bgcolor: 'transparent', color: '#64748B' }}>Status</StyledTableCell>
                                                            </StyledTableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {allData.map((data, idx) => (
                                                                <StyledTableRow key={idx}>
                                                                    <StyledTableCell sx={{ border: 'none' }}>{new Date(data.date).toISOString().substring(0, 10)}</StyledTableCell>
                                                                    <StyledTableCell align="right" sx={{ border: 'none' }}>
                                                                        <Chip icon={data.status === "Present" ? <DoneAll sx={{ fontSize: '14px !important' }} /> : <EventBusy sx={{ fontSize: '14px !important' }} />} label={data.status} size="small" color={data.status === "Present" ? "success" : "error"} variant="outlined" />
                                                                    </StyledTableCell>
                                                                </StyledTableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableBody>
                            ))}
                        </Table>
                    </Box>

                    {/* Mobile Card Layout */}
                    <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                        {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => (
                            <Card key={index} sx={{ p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="800">{subName}</Typography>
                                    <Typography variant="h6" fontWeight="900" color="primary">{calculateSubjectAttendancePercentage(present, sessions)}%</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" spacing={3} mb={2}>
                                    <Box><Typography variant="caption" color="textSecondary">Present</Typography><Typography variant="body2" fontWeight="700">{present}</Typography></Box>
                                    <Box><Typography variant="caption" color="textSecondary">Total</Typography><Typography variant="body2" fontWeight="700">{sessions}</Typography></Box>
                                </Stack>
                                <Button fullWidth variant="contained" disableElevation onClick={() => handleOpen(subId)} sx={{ borderRadius: '8px', bgcolor: '#F1F5F9', color: '#1E293B', '&:hover': { bgcolor: '#E2E8F0' } }}>
                                    {openStates[subId] ? "Hide Logs" : "View History"}
                                </Button>
                                <Collapse in={openStates[subId]} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
                                    <Stack spacing={1}>
                                        {allData.map((data, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                                                <Typography variant="caption" fontWeight="700">{new Date(data.date).toISOString().substring(0, 10)}</Typography>
                                                <Typography variant="caption" fontWeight="900" color={data.status === "Present" ? "success.main" : "error.main"}>{data.status.toUpperCase()}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            </Fade>
        )
    }

    const renderChartSection = () => {
        return (
            <Fade in={true}>
                <Box sx={{ mb: 10, mt: 2 }}>
                    <Card sx={{ p: { xs: 1, md: 3 }, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                        <Typography variant="h6" fontWeight="900" sx={{ mb: 3, px: 2 }}>Attendance Performance</Typography>
                        <Box sx={{ height: { xs: 300, md: 450 } }}>
                            <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                        </Box>
                    </Card>
                </Box>
            </Fade>
        )
    };

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pt: 2 }}>
            <Container maxWidth="md">
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                            <>
                                {selectedSection === 'table' && renderTableSection()}
                                {selectedSection === 'chart' && renderChartSection()}

                                <Paper sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: { xs: '90%', sm: '400px' }, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} elevation={0}>
                                    <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels sx={{ height: 65 }}>
                                        <BottomNavigationAction label="List" value="table" icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />} />
                                        <BottomNavigationAction label="Trends" value="chart" icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />} />
                                    </BottomNavigation>
                                </Paper>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', mt: 10 }}>
                                <Typography variant="h6" color="textSecondary">No attendance records found.</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Container>
        </Box>
    )
}

export default ViewStdAttendance;