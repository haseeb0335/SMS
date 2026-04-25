import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
    IconButton, Button, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Box, 
    CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    Stack, Card, CardContent, Divider, useTheme, useMediaQuery, Chip
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // New Icon

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://sms-xi-rose.vercel.app";

const ShowFees = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [feesList, setFeesList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/AllFees`);
            setFeesList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch Fees Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    // POS Receipt Logic (Opens a new window for printing)
    const downloadPOSReceipt = (className, month, fees) => {
        const total = fees.reduce((sum, f) => sum + Number(f.amount), 0);
        const receiptWindow = window.open("", "_blank", "width=400,height=600");
        
        const content = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 10px; }
                        .center { text-align: center; }
                        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                        table { width: 100%; }
                        th { text-align: left; }
                        td { text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h2>SCHOOL RECEIPT</h2>
                        <p>${new Date().toLocaleString()}</p>
                    </div>
                    <div class="line"></div>
                    <p>Class: ${className}</p>
                    <p>Month: ${month}</p>
                    <div class="line"></div>
                    <table>
                        ${fees.map(f => `<tr><td>${f.studentName}</td><td>Rs. ${f.amount}</td></tr>`).join('')}
                    </table>
                    <div class="line"></div>
                    <h3 class="center">TOTAL: Rs. ${total}</h3>
                    <p class="center">THANK YOU!</p>
                </body>
            </html>
        `;
        receiptWindow.document.write(content);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    // PDF Export Logic
    const downloadPDF = (className, month, fees) => {
        const doc = new jsPDF();
        const total = fees.reduce((sum, f) => sum + Number(f.amount), 0);

        doc.setFontSize(20);
        doc.setTextColor(25, 118, 210);
        doc.text("Fee Collection Report", 14, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Class: ${className}`, 14, 30);
        doc.text(`Month: ${month}`, 14, 37);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 44);

        const tableColumn = ["#", "Student Name", "Date", "Amount (PKR)"];
        const tableRows = fees.map((f, index) => [
            index + 1,
            f.studentName,
            new Date(f.date).toLocaleDateString(),
            `Rs. ${f.amount}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: [25, 118, 210] },
            foot: [['', '', 'Total Collection:', `Rs. ${total}`]],
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontWeight: 'bold' }
        });

        doc.save(`Fee_Report_${className}_${month.replace(' ', '_')}.pdf`);
    };

    const handleDeleteFee = async (feeId) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.put(`${BASE_URL}/DeleteFee/${feeId}`);
            setFeesList((prev) => prev.filter((fee) => fee._id !== feeId));
        } catch (err) { console.log("Delete Error:", err); }
    };

    const handleEditFee = async (fee) => {
        const newAmount = prompt("Enter new amount", fee.amount);
        if (!newAmount || isNaN(newAmount)) return;
        try {
            await axios.put(`${BASE_URL}/EditFee/${fee._id}`, { amount: Number(newAmount) });
            setFeesList((prev) => prev.map((f) => f._id === fee._id ? { ...f, amount: Number(newAmount) } : f));
        } catch (err) { console.log("Edit Error:", err); }
    };

    const exportToExcel = () => {
        if (feesList.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(feesList.map((f, i) => ({
            No: i + 1, Class: f.className, Student: f.studentName, Amount: f.amount, Date: new Date(f.date).toLocaleDateString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Fees");
        XLSX.writeFile(workbook, "Full_Fee_Report.xlsx");
    };

    const groupedData = feesList.reduce((acc, fee) => {
        const className = fee.className || "Unassigned Class";
        const monthName = new Date(fee.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[className]) acc[className] = {};
        if (!acc[className][monthName]) acc[className][monthName] = [];
        acc[className][monthName].push(fee);
        return acc;
    }, {});

    const totalCollection = feesList.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={900}>Finance Hub</Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Export Excel</Button>
            </Stack>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceWalletIcon color="primary" fontSize="large" />
                <Box>
                    <Typography variant="caption" color="textSecondary">GRAND TOTAL COLLECTION</Typography>
                    <Typography variant="h5" fontWeight={800}>Rs. {totalCollection.toLocaleString()}</Typography>
                </Box>
            </Paper>

            {Object.entries(groupedData).map(([className, months], cIdx) => (
                <Accordion key={cIdx} sx={{ mb: 2, borderRadius: '12px !important', overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <SchoolIcon sx={{ mr: 2 }} color="action" />
                        <Typography fontWeight={700}>{className}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: '#fafafa' }}>
                        {Object.entries(months).map(([month, fees], mIdx) => {
                            const monthlyTotal = fees.reduce((sum, f) => sum + Number(f.amount), 0);
                            return (
                                <Accordion key={mIdx} variant="outlined" sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Stack direction="row" justifyContent="space-between" width="100%" pr={2}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarMonthIcon fontSize="small" />
                                                <Typography variant="subtitle2">{month}</Typography>
                                            </Stack>
                                            <Typography variant="subtitle2" fontWeight={700} color="success.main">Rs. {monthlyTotal}</Typography>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {/* Download Buttons Section */}
                                        <Stack direction="row" spacing={2} justifyContent="flex-end" mb={2}>
                                            <Button 
                                                size="small" variant="contained" color="error"
                                                startIcon={<PictureAsPdfIcon />}
                                                onClick={() => downloadPDF(className, month, fees)}
                                            >PDF</Button>
                                            <Button 
                                                size="small" variant="contained" color="secondary"
                                                startIcon={<ReceiptLongIcon />}
                                                onClick={() => downloadPOSReceipt(className, month, fees)}
                                            >POS Receipt</Button>
                                        </Stack>

                                        {/* Table/Cards Rendering ... (Remaining code kept same) */}
                                        {isMobile ? (
                                            fees.map(f => (
                                                <Card key={f._id} sx={{ mb: 1 }}>
                                                    <CardContent>
                                                        <Typography variant="subtitle1" fontWeight={700}>{f.studentName}</Typography>
                                                        <Typography color="success.main" fontWeight={800}>Rs. {f.amount}</Typography>
                                                        <Stack direction="row" justifyContent="flex-end">
                                                            <IconButton onClick={() => handleEditFee(f)}><EditIcon fontSize="small" /></IconButton>
                                                            <IconButton onClick={() => handleDeleteFee(f._id)}><DeleteIcon fontSize="small" color="error"/></IconButton>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <TableContainer component={Paper} elevation={0}>
                                                <Table size="small">
                                                    <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Amount</TableCell><TableCell>Date</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                                                    <TableBody>
                                                        {fees.map(f => (
                                                            <TableRow key={f._id}>
                                                                <TableCell>{f.studentName}</TableCell>
                                                                <TableCell sx={{ fontWeight: 700 }}>Rs. {f.amount}</TableCell>
                                                                <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                                                                <TableCell align="right">
                                                                    <IconButton onClick={() => handleEditFee(f)}><EditIcon fontSize="small" /></IconButton>
                                                                    <IconButton onClick={() => handleDeleteFee(f._id)}><DeleteIcon fontSize="small" color="error"/></IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default ShowFees;