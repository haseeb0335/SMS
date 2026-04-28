import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
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
    Cell, PieChart, Pie, Legend, AreaChart, Area 
} from 'recharts';

// Icons
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from '@mui/icons-material/School';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5001";

const ShowFees = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
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

    const lineChartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = feesList.reduce((acc, fee) => {
            const month = new Date(fee.date).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + Number(fee.amount);
            return acc;
        }, {});
        return months.filter(m => monthlyData[m]).map(name => ({ name, amount: monthlyData[name] }));
    }, [feesList]);

    const pieChartData = useMemo(() => {
        const totalStudents = studentsList?.length || 0;
        const paidStudents = feesList.reduce((acc, fee) => { acc.add(fee.studentId); return acc; }, new Set()).size;
        return [
            { name: 'Paid', value: paidStudents, color: '#10b981' },
            { name: 'Unpaid', value: Math.max(0, totalStudents - paidStudents), color: '#ef4444' }
        ];
    }, [studentsList, feesList]);

    const classChartData = useMemo(() => {
        return Object.entries(groupedData).map(([name, data]) => ({
            name,
            total: data.total
        }));
    }, [groupedData]);

    const downloadClassPDF = (className, data) => {
        const doc = new jsPDF();
        doc.setFontSize(18).text(`Class Report: ${className} (${selectedMonth})`, 14, 20);
        const rows = data.students.map(s => [s.rollNum, s.name, s.feeHistory.length > 0 ? 'Paid' : 'Unpaid', `Rs. ${s.feeHistory.reduce((sum, f) => sum + Number(f.amount), 0)}`]);
        autoTable(doc, { head: [['Roll No', 'Name', 'Status', 'Total Paid']], body: rows, startY: 35, theme: 'grid', headStyles: { fillColor: [25, 118, 210] } });
        doc.save(`${className}_${selectedMonth}_Report.pdf`);
    };

    const downloadIndividualPOS = (fee) => {
        const receiptWindow = window.open("", "_blank", "width=400,height=600");
        receiptWindow.document.write(`<html><body style="font-family:monospace; width:280px; padding:20px;"><center><h2>FEE RECEIPT</h2><hr/></center><p><b>Student:</b> ${fee.studentName}</p><p><b>Class:</b> ${fee.className}</p><p><b>Month:</b> ${fee.feeMonth}</p><p><b>Amount: Rs. ${fee.amount}</b></p><hr/><center><p>Thank You!</p></center></body></html>`);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} mb={4} spacing={2}>
                <Typography variant="h4" fontWeight={900} color="primary">Financial Analytics</Typography>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <InputLabel id="month-select-label">Select Month</InputLabel>
                    <Select
                        labelId="month-select-label"
                        value={selectedMonth}
                        label="Select Month"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        startAdornment={<CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                    >
                        {availableMonths.map((month, i) => (
                            <MenuItem key={i} value={month}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ p: 3, borderRadius: 5, height: '100%', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Collection ({selectedMonth})</Typography>
                        <Typography variant={isMobile ? "h4" : "h3"} fontWeight={900}>
                            Rs. {Object.values(groupedData).reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={1} alignItems="center"><TrendingUpIcon fontSize="small" /><Typography variant="caption">REAL-TIME</Typography></Stack>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 2, borderRadius: 5, height: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BarChartIcon color="primary" fontSize="small" /> CLASS-WISE COLLECTION
                        </Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={classChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="total" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 5, height: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" mb={1}>PAYMENT STATUS RATIO</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie data={pieChartData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>

            {Object.entries(groupedData).map(([className, data], idx) => (
                <Accordion key={idx} sx={{ mb: 2, borderRadius: '20px !important', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center" width="100%">
                            <SchoolIcon color="primary" />
                            {/* Class Name and Month side by side */}
                            <Typography fontWeight={800}>{className} ({selectedMonth})</Typography>
                            <Chip label={`Total: Rs. ${data.total.toLocaleString()}`} size="small" sx={{ fontWeight: 800, bgcolor: '#e0f2fe', color: '#0369a1' }} />
                            {!isMobile && <Box sx={{ flexGrow: 1 }} />}
                            <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={(e) => { e.stopPropagation(); downloadClassPDF(className, data); }} variant="text">Report</Button>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Amount Paid</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.students.map((student) => {
                                        const latestFee = student.feeHistory[student.feeHistory.length - 1];
                                        return (
                                            <TableRow key={student._id} hover>
                                                <TableCell>{student.rollNum}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{student.name}</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                    {latestFee ? `Rs. ${Number(latestFee.amount).toLocaleString()}` : "Rs. 0"}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={latestFee ? "Paid" : "Unpaid"} 
                                                        color={latestFee ? "success" : "error"} 
                                                        size="small" 
                                                        sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {latestFee ? (
                                                        <IconButton size="small" onClick={() => downloadIndividualPOS(latestFee)} color="primary"><ReceiptLongIcon fontSize="small" /></IconButton>
                                                    ) : (
                                                        <Button variant="outlined" size="small" onClick={() => navigate("/Admin/fees")}>Collect</Button>
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