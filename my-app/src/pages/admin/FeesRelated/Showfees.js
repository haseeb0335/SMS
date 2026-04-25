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
    Stack, Card, useTheme, useMediaQuery, Chip, Grid, Container
} from "@mui/material";

// Charts
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, LineChart, Line, Legend 
} from 'recharts';

// Icons
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from '@mui/icons-material/School';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ShowFees = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { studentsList } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [feesList, setFeesList] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const groupedData = useMemo(() => {
        if (!studentsList) return {};
        const groups = {};
        
        studentsList.forEach((student) => {
            const className = student.sclassName?.sclassName || "Unassigned";
            if (!groups[className]) groups[className] = { students: [], total: 0, paidCount: 0 };
            
            const studentFees = feesList.filter(f => f.studentId === student._id);
            const feeSum = studentFees.reduce((sum, f) => sum + Number(f.amount), 0);

            groups[className].students.push({ ...student, feeHistory: studentFees });
            groups[className].total += feeSum;
            if (studentFees.length > 0) groups[className].paidCount++;
        });
        return groups;
    }, [studentsList, feesList]);

    // --- CHART DATA PREP ---
    const lineChartData = useMemo(() => {
        const monthlyData = feesList.reduce((acc, fee) => {
            const month = new Date(fee.date).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + Number(fee.amount);
            return acc;
        }, {});
        return Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
    }, [feesList]);

    const pieChartData = useMemo(() => {
        const totalStudents = studentsList?.length || 0;
        const paidStudents = feesList.reduce((acc, fee) => {
            acc.add(fee.studentId);
            return acc;
        }, new Set()).size;
        return [
            { name: 'Paid', value: paidStudents, color: '#4caf50' },
            { name: 'Unpaid', value: Math.max(0, totalStudents - paidStudents), color: '#f44336' }
        ];
    }, [studentsList, feesList]);

    // --- DOWNLOADS ---
    const downloadClassPDF = (className, data) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Class Report: ${className}`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

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
            headStyles: { fillColor: [25, 118, 210] }
        });
        doc.save(`${className}_Report.pdf`);
    };

    const downloadIndividualPOS = (fee) => {
        const receiptWindow = window.open("", "_blank", "width=400,height=600");
        receiptWindow.document.write(`
            <html><body style="font-family:monospace; width:280px; padding:20px;">
                <center><h2>FEE RECEIPT</h2><hr/></center>
                <p><b>Student:</b> ${fee.studentName}</p>
                <p><b>Class:</b> ${fee.className}</p>
                <p><b>Date:</b> ${new Date(fee.date).toLocaleDateString()}</p>
                <p><b>Amount: Rs. ${fee.amount}</b></p>
                <hr/><center><p>Thank You!</p></center>
            </body></html>
        `);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight={900} color="primary" gutterBottom>Financial Analytics</Typography>

            <Grid container spacing={3} mb={4}>
                {/* Revenue Card */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="overline" sx={{ opacity: 0.8 }}>Total Collection</Typography>
                        <Typography variant="h4" fontWeight={900}>Rs. {feesList.reduce((s, f) => s + Number(f.amount), 0).toLocaleString()}</Typography>
                        <Stack direction="row" spacing={1} mt={1}><TrendingUpIcon /><Typography variant="caption">Live Update</Typography></Stack>
                    </Card>
                </Grid>

                {/* Line Chart */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 2, borderRadius: 4, height: 250 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Monthly Revenue Trend</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                {/* Pie Chart */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, borderRadius: 4, height: 250 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Payment Status Ratio</Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie data={pieChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>

            {/* Class-wise Lists */}
            {Object.entries(groupedData).map(([className, data], idx) => (
                <Accordion key={idx} sx={{ mb: 2, borderRadius: '16px !important', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center" width="100%" pr={2}>
                            <SchoolIcon color="primary" />
                            <Typography fontWeight={800} variant="h6">{className}</Typography>
                            <Chip label={`${data.students.length} Students`} size="small" variant="outlined" />
                            <Box sx={{ flexGrow: 1 }} />
                            <Button 
                                size="small" 
                                startIcon={<PictureAsPdfIcon />} 
                                onClick={(e) => { e.stopPropagation(); downloadClassPDF(className, data); }}
                                variant="contained"
                                color="inherit"
                                sx={{ bgcolor: '#f1f5f9', color: '#1e293b' }}
                            >
                                Class PDF
                            </Button>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.students.map((student) => {
                                        const latestFee = student.feeHistory[student.feeHistory.length - 1];
                                        return (
                                            <TableRow key={student._id} hover>
                                                <TableCell>{student.rollNum}</TableCell>
                                                <TableCell fontWeight={600}>{student.name}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={latestFee ? "Paid" : "Unpaid"} 
                                                        color={latestFee ? "success" : "error"} 
                                                        size="small" 
                                                        variant={latestFee ? "outlined" : "filled"}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {latestFee ? (
                                                        <IconButton size="small" onClick={() => downloadIndividualPOS(latestFee)} color="primary">
                                                            <ReceiptLongIcon fontSize="small" />
                                                        </IconButton>
                                                    ) : (
                                                        <Button size="small" onClick={() => navigate("/Admin/fees")}>Collect</Button>
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