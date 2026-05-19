import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Redux Action
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';

// MUI Components
import { 
    IconButton, Button, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Box, 
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Stack, Card, useTheme, useMediaQuery, Chip, Grid, Container,
    MenuItem, Select, FormControl, InputLabel
} from "@mui/material";

// Charts
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, Legend
} from 'recharts';

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from '@mui/icons-material/School';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ShowFees = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
    
    const { studentsList } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [feesList, setFeesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState("All");

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
        fetchFees();
    }, [currentUser._id, dispatch]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/AllFees`);
            setFeesList(Array.isArray(res.data) ? res.data : res.data.allFees || []);
        } catch (err) {
            console.error("Fetch Fees Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const availableMonths = useMemo(() => {
        const months = feesList.map(f => f.feeMonth).filter(Boolean);
        return ["All", ...new Set(months)];
    }, [feesList]);

    const groupedData = useMemo(() => {
        if (!studentsList) return {};
        const groups = {};
        
        studentsList.forEach((student) => {
            const className = student.sclassName?.sclassName || "Unassigned";
            if (!groups[className]) groups[className] = { students: [], total: 0, paidCount: 0 };
            
            const studentFees = feesList.filter(f => {
                const matchStudent = f.studentId === student._id;
                const matchMonth = selectedMonth === "All" || f.feeMonth === selectedMonth;
                return matchStudent && matchMonth;
            });

            const feeSum = studentFees.reduce((sum, f) => sum + Number(f.amount), 0);

            groups[className].students.push({ ...student, feeHistory: studentFees });
            groups[className].total += feeSum;
            if (studentFees.length > 0) groups[className].paidCount++;
        });
        return groups;
    }, [studentsList, feesList, selectedMonth]);

    const pieChartData = useMemo(() => {
        const totalStudents = studentsList?.length || 0;
        const paidStudents = feesList.reduce((acc, fee) => { acc.add(fee.studentId); return acc; }, new Set()).size;
        return [
            { name: 'Paid Records', value: paidStudents, color: '#10b981' },
            { name: 'Unpaid Records', value: Math.max(0, totalStudents - paidStudents), color: '#ef4444' }
        ];
    }, [studentsList, feesList]);

    const classChartData = useMemo(() => {
        return Object.entries(groupedData).map(([name, data]) => ({
            name,
            total: data.total
        })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }, [groupedData]);

    const downloadClassPDF = (className, data) => {
        const doc = new jsPDF();
        doc.setFontSize(18).text(`Class Report: ${className} (${selectedMonth})`, 14, 20);
        const rows = data.students.map(s => [
            s.rollNum, 
            s.name, 
            s.feeHistory.length > 0 ? 'Paid' : 'Unpaid', 
            `Rs. ${s.feeHistory.reduce((sum, f) => sum + Number(f.amount), 0)}`
        ]);
        autoTable(doc, { 
            head: [['Roll No', 'Name', 'Status', 'Total Paid']], 
            body: rows, 
            startY: 35, 
            theme: 'grid', 
            headStyles: { fillColor: [37, 99, 235] } 
        });
        doc.save(`${className}_${selectedMonth}_Report.pdf`);
    };

    const downloadIndividualPOS = (fee) => {
        const receiptWindow = window.open("", "_blank", "width=400,height=600");
        receiptWindow.document.write(`<html><body style="font-family:monospace; width:280px; padding:20px;"><center><h2>FEE RECEIPT</h2><hr/></center><p><b>Student:</b> ${fee.studentName}</p><p><b>Class:</b> ${fee.className}</p><p><b>Month:</b> ${fee.feeMonth}</p><p><b>Amount: Rs. ${fee.amount}</b></p><hr/><center><p>Thank You!</p></center></body></html>`);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress strokeWidth={3} />
            </Box>
        );
    }

    const grandTotalCollection = Object.values(groupedData).reduce((acc, curr) => acc + curr.total, 0);

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1.5, md: 4 }, mb: 4, px: { xs: 1.5, sm: 3 } }}>
            
            {/* Top SaaS Heading Header Section */}
            <Stack 
                direction={isMobile ? "column" : "row"} 
                justifyContent="space-between" 
                alignItems={isMobile ? "stretch" : "center"} 
                mb={4} 
                spacing={2}
            >
                <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                    Financial Analytics
                </Typography>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: { xs: '100%', sm: 220 }, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                    <InputLabel id="month-select-label">Select Active Month</InputLabel>
                    <Select
                        labelId="month-select-label"
                        value={selectedMonth}
                        label="Select Active Month"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: '#64748b', fontSize: '1.25rem' }} />}
                    >
                        {availableMonths.map((month, i) => (
                            <MenuItem key={i} value={month}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Dashboard Analytics Responsive Grid Row Section */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4, alignItems: 'stretch' }}>
                
                {/* Total Stats Banner Summary Mini-Card */}
                <Grid item xs={12} md={3.5}>
                    <Card sx={{ p: 3, borderRadius: '24px', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 800, letterSpacing: 1.2, display: 'block' }}>
                            Total Collection ({selectedMonth})
                        </Typography>
                        <Typography variant={isMobile ? "h4" : "h3"} fontWeight={900} sx={{ my: 1, letterSpacing: '-1px' }}>
                            Rs. {grandTotalCollection.toLocaleString()}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: '1.15rem', color: '#10b981' }} />
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, letterSpacing: 0.5 }}>LIVE STREAM MONITORING</Typography>
                        </Stack>
                    </Card>
                </Grid>

                {/* Micro Pill Styled Recharts Bar Visualizer */}
                <Grid item xs={12} md={5.5}>
                    <Paper sx={{ p: 2.5, borderRadius: '24px', height: { xs: 240, sm: 280 }, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" fontWeight="800" color="#64748b" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                            <BarChartIcon sx={{ color: '#3b82f6' }} /> Class-wise Breakdown
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={classChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)' }} />
                                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={isMobile ? 16 : 24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Donut Style Metric Balance Chart Component */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2.5, borderRadius: '24px', height: { xs: 240, sm: 280 }, border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" fontWeight="800" color="#64748b" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                            Payment Status Ratio
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={pieChartData} innerRadius={isMdUp ? 52 : 45} outerRadius={isMdUp ? 70 : 60} paddingAngle={6} dataKey="value" stroke="none">
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px' }} />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#475569' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Accordion Lists Sections Containing Tabular Students Groupings */}
            {Object.entries(groupedData).map(([className, data], idx) => (
                <Accordion key={idx} sx={{ mb: 2, borderRadius: '16px !important', border: '1px solid #e2e8f0', boxShadow: 'none', '&:before': { display: 'none' }, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, width: '100%', pr: 1 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <SchoolIcon sx={{ color: '#3b82f6' }} />
                                <Typography fontWeight={800} color="#0f172a">{className}</Typography>
                            </Stack>
                            
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, ml: { sm: 'auto' }, justifyContent: 'space-between' }}>
                                <Chip label={`Collected: Rs. ${data.total.toLocaleString()}`} size="small" sx={{ fontWeight: 800, bgcolor: '#f0fdf4', color: '#16a34a', borderRadius: '8px' }} />
                                <Button 
                                    size="small" 
                                    startIcon={<PictureAsPdfIcon />} 
                                    onClick={(e) => { e.stopPropagation(); downloadClassPDF(className, data); }} 
                                    variant="outlined"
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', color: '#64748b', borderColor: '#e2e8f0', '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' } }}
                                >
                                    PDF Report
                                </Button>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, borderTop: '1px solid #f1f5f9' }}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748b', py: 1.5 }}>Roll No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748b', py: 1.5 }}>Student Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748b', py: 1.5 }}>Amount Paid</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#64748b', py: 1.5 }}>Status Alignment</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b', py: 1.5 }}>Action Trigger</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.students.map((student) => {
                                        const latestFee = student.feeHistory[student.feeHistory.length - 1];
                                        return (
                                            <TableRow key={student._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ py: 1.5, fontWeight: 600, color: '#475569' }}>{student.rollNum}</TableCell>
                                                <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#0f172a' }}>{student.name}</TableCell>
                                                <TableCell sx={{ py: 1.5, fontWeight: 800, color: latestFee ? '#10b981' : '#64748b' }}>
                                                    {latestFee ? `Rs. ${Number(latestFee.amount).toLocaleString()}` : "Rs. 0"}
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Chip 
                                                        label={latestFee ? "Paid Match" : "Unpaid Balance"} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontWeight: 800, 
                                                            fontSize: '0.65rem', 
                                                            textTransform: 'uppercase',
                                                            bgcolor: latestFee ? '#e6f4ea' : '#fce8e6',
                                                            color: latestFee ? '#137333' : '#c5221f',
                                                            borderRadius: '6px'
                                                        }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    {latestFee ? (
                                                        <IconButton size="small" onClick={() => downloadIndividualPOS(latestFee)} sx={{ color: '#3b82f6', p: 1 }}>
                                                            <ReceiptLongIcon fontSize="small" />
                                                        </IconButton>
                                                    ) : (
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            onClick={() => navigate("/Admin/fees")} 
                                                            sx={{ textTransform: 'none', borderRadius: '8px', px: 2, fontWeight: 700, boxShadow: 'none', bgcolor: '#3b82f6', '&:hover': { boxShadow: 'none', bgcolor: '#2563eb' } }}
                                                        >
                                                            Collect
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
};

export default ShowFees;