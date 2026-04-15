import React, { useEffect, useState } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
    Button,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Box,
    Chip,
    Divider,
    Collapse,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from '@mui/icons-material/Refresh';

const TeacherDetails = () => {

    const params = useParams();
    const dispatch = useDispatch();

    const { loading, teacherDetails } = useSelector((state) => state.teacher);

    const [expandedMonths, setExpandedMonths] = useState({});

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    const handleRefresh = () => {
        dispatch(getTeacherDetails(teacherID));
    };

    const toggleMonth = (month) => {
        setExpandedMonths(prev => ({
            ...prev,
            [month]: !prev[month]
        }));
    };

    /* ---------- Separate Records ---------- */

    const attendanceOnly = teacherDetails?.attendance?.filter(a => a.status !== "Leave") || [];
    const leaveRecords = teacherDetails?.attendance?.filter(a => a.status === "Leave") || [];

    /* ---------- Group Attendance By Month ---------- */

    const groupAttendanceByMonth = () => {

        const groups = {};

        const sortedData = [...attendanceOnly].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        sortedData.forEach((log) => {

            const dateObj = new Date(log.date);

            const monthName = dateObj.toLocaleString('default', {
                month: 'long',
                year: 'numeric'
            });

            if (!groups[monthName]) groups[monthName] = [];

            groups[monthName].push(log);

        });

        return groups;
    };

    const attendanceGroups = groupAttendanceByMonth();

    const sortedMonths = Object.keys(attendanceGroups).sort(
        (a, b) => new Date(b) - new Date(a)
    );

    const renderLocation = (location) => {

        if (!location) return "No GPS";

        if (typeof location === "object") {

            const { latitude, longitude } = location;

            return (
                <IconButton
                    color="primary"
                    size="small"
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                >
                    <LocationOnIcon fontSize="small" />
                </IconButton>
            );
        }

        return (
            <IconButton
                color="primary"
                size="small"
                href={`https://www.google.com/maps?q=${location}`}
                target="_blank"
            >
                <LocationOnIcon fontSize="small" />
            </IconButton>
        );
    };

    return (

        <Container sx={{ mt: 4, mb: 4 }}>

            {loading ? (

                <Box display="flex" justifyContent="center" mt={10}>
                    <Typography variant="h6">Syncing Records...</Typography>
                </Box>

            ) : (

                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>

                    {/* HEADER */}

                    <Stack direction="row" justifyContent="space-between" mb={3}>

                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {teacherDetails?.name}
                            </Typography>

                            <Typography variant="body1">
                                {teacherDetails?.teachSclass?.sclassName} |
                                {teacherDetails?.teachSubject?.subName}
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                        >
                            Refresh Feed
                        </Button>

                    </Stack>

                    <Divider sx={{ mb: 4 }} />

                    {/* ATTENDANCE RECORDS */}

                    <Typography variant="h5" fontWeight="bold" mb={2}>
                        Attendance Records
                    </Typography>

                    {sortedMonths.map((month) => (

                        <Box key={month} mb={2}>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => toggleMonth(month)}
                                sx={{ justifyContent: 'space-between' }}
                            >

                                <Typography fontWeight="bold">{month}</Typography>

                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={`${attendanceGroups[month].length} Days`}
                                        size="small"
                                    />
                                    {expandedMonths[month] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </Stack>

                            </Button>

                            <Collapse in={expandedMonths[month]}>

                                <TableContainer component={Paper} sx={{ mt: 1 }}>

                                    <Table size="small">

                                        <TableHead>

                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Check-In Time</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="center">Location</TableCell>
                                            </TableRow>

                                        </TableHead>

                                        <TableBody>

                                            {attendanceGroups[month].map((log, index) => {

                                                const dateObj = new Date(log.date);

                                                return (

                                                    <TableRow key={index} hover>

                                                        <TableCell>
                                                            {dateObj.toLocaleDateString()}
                                                        </TableCell>

                                                        <TableCell>
                                                            {log.time}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Chip
                                                                label={log.status}
                                                                color={log.status === "Absent" ? "error" : "success"}
                                                                size="small"
                                                            />
                                                        </TableCell>

                                                        <TableCell align="center">
                                                            {renderLocation(log.location)}
                                                        </TableCell>

                                                    </TableRow>

                                                );
                                            })}

                                        </TableBody>

                                    </Table>

                                </TableContainer>

                            </Collapse>

                        </Box>

                    ))}

                    {/* LEAVE RECORDS */}

                    <Divider sx={{ mt: 5, mb: 3 }} />

                    <Typography variant="h5" fontWeight="bold" mb={2}>
                        Leave Records
                    </Typography>

                    {leaveRecords.length > 0 ? (

                        <TableContainer component={Paper}>

                            <Table size="small">

                                <TableHead>

                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>

                                </TableHead>

                                <TableBody>

                                    {leaveRecords.map((leave, i) => (

                                        <TableRow key={i}>

                                            <TableCell>
                                                {new Date(leave.date).toLocaleDateString()}
                                            </TableCell>

                                            <TableCell>
                                                {leave.reason || "-"}
                                            </TableCell>

                                            <TableCell>
                                                <Chip label="Leave" color="warning" size="small" />
                                            </TableCell>

                                        </TableRow>

                                    ))}

                                </TableBody>

                            </Table>

                        </TableContainer>

                    ) : (

                        <Typography color="textSecondary">
                            No leave records found.
                        </Typography>

                    )}

                </Paper>

            )}

        </Container>

    );
};

export default TeacherDetails;