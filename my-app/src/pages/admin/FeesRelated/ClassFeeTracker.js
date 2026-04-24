import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Accordion, 
    AccordionSummary, AccordionDetails, Stack, CircularProgress 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ClassFeeTracker = () => {
    const [loading, setLoading] = useState(true);
    const [classGroups, setClassGroups] = useState({});

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch all students (Admissions) and all paid records (Fees)
            const [studentsRes, feesRes] = await Promise.all([
                axios.get(`${BASE_URL}/tracker/class-wise`), 
                axios.get(`${BASE_URL}/tracker/stats`)
            ]);

            const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
            const allPaidFees = Array.isArray(feesRes.data) ? feesRes.data : [];

            // Grouping logic: Organizing by Class
            const groups = {};

            allStudents.forEach(student => {
                const className = student.className || "Other";
                if (!groups[className]) groups[className] = [];

                // Check if this student exists in the Paid Fees collection
                // We match by studentName (ensure names are unique or add an ID match)
                const hasPaid = allPaidFees.some(fee => 
                    fee.studentName.toLowerCase() === student.studentName.toLowerCase() &&
                    fee.className === student.className
                );

                groups[className].push({
                    ...student,
                    isPaid: hasPaid
                });
            });

            setClassGroups(groups);
        } catch (err) {
            console.error("Tracker Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight={900} mb={4} color="#1e293b">
                Class-Wise Fee Status
            </Typography>

            {Object.entries(classGroups).sort().map(([className, students], idx) => {
                const paidCount = students.filter(s => s.isPaid).length;
                const totalCount = students.length;

                return (
                    <Accordion key={idx} sx={{ mb: 2, borderRadius: '12px !important' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                <SchoolIcon color="primary" />
                                <Typography variant="h6" fontWeight={700}>{className}</Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <Chip 
                                    label={`${paidCount}/${totalCount} Paid`} 
                                    color={paidCount === totalCount ? "success" : "warning"}
                                    size="small"
                                />
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} elevation={0}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Father Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {students.map((student, sIdx) => (
                                            <TableRow key={sIdx} hover>
                                                <TableCell>{student.studentName}</TableCell>
                                                <TableCell>{student.fatherName}</TableCell>
                                                <TableCell align="center">
                                                    {student.isPaid ? (
                                                        <Chip 
                                                            icon={<CheckCircleIcon />} 
                                                            label="PAID" 
                                                            color="success" 
                                                            variant="filled"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Chip 
                                                            icon={<CancelIcon />} 
                                                            label="UNPAID" 
                                                            color="error" 
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default ClassFeeTracker;