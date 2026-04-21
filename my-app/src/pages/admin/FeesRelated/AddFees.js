import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    IconButton, TextField, Button, Typography, Paper, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Stack,
    Grid, useTheme, useMediaQuery
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AddFees = () => {
    const theme = useTheme();
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [feesList, setFeesList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    
    // Form States
    const [fatherName, setFatherName] = useState("");
    const [feeMonth, setFeeMonth] = useState("");
    const [previousDues, setPreviousDues] = useState("0");
    const [totalDues, setTotalDues] = useState("0");
    const [receivedBy, setReceivedBy] = useState("");
    const [amount, setAmount] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState(""); // NEW
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [filterMonth, setFilterMonth] = useState("All");
    const [filterClass, setFilterClass] = useState("All");

    const user = JSON.parse(localStorage.getItem("user"));
    const schoolId = user?._id;
    const schoolName = user?.schoolName || "School System";

    useEffect(() => {
        const prev = Number(previousDues) || 0;
        const paid = Number(amount) || 0;
        const balance = prev - paid;
        
        if (balance === 0 || balance < 0) {
            setTotalDues("0");
        } else {
            setTotalDues(`-${balance}`);
        }
    }, [previousDues, amount]);

    const sendWhatsAppMessage = (feeData) => {
        if (!whatsappNumber) return;
        
        const message = `*FEE NOTIFICATION: ${schoolName}*%0A%0A` +
            `*Student:* ${feeData.studentName}%0A` +
            `*Class:* ${feeData.className}%0A` +
            `*Month:* ${feeData.feeMonth}%0A` +
            `*Amount Paid:* Rs. ${feeData.amount}%0A` +
            `*Remaining Balance:* Rs. ${feeData.totalDues}%0A%0A` +
            `Thank you for your payment.`;

        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
        const student = students.find(s => s._id === studentId);
        if (student) {
            setFatherName(student.fatherName || ""); 
        }
    };

    const fetchAllFees = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/AllFees`);
            setFeesList(Array.isArray(res.data) ? res.data : []);
        } catch (err) { 
            console.error("Error fetching fees:", err); 
        }
    }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
                setClasses(res.data);
            } catch (err) { console.error(err); }
        };
        if (schoolId) fetchClasses();
        fetchAllFees();
    }, [schoolId, fetchAllFees]);

    useEffect(() => {
        if (!selectedClass) return;
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`);
                setStudents(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStudents();
    }, [selectedClass]);

    const selectedClassObj = classes.find(c => c._id === selectedClass);

    const handleAddFee = async () => {
        if (!selectedStudent || !amount || !feeMonth || !receivedBy) {
            return toast.warning("Please fill all required fields");
        }

        const studentObj = students.find(s => s._id === selectedStudent);
        const feeData = { 
            studentId: selectedStudent,
            studentName: studentObj?.name,
            fatherName: fatherName,
            className: selectedClassObj?.sclassName, 
            feeMonth: feeMonth,
            previousDues: Number(previousDues) || 0,
            totalDues: totalDues,
            receivedBy: receivedBy,
            amount: Number(amount),
            date: date 
        };

        try {
            const response = await axios.post(`${BASE_URL}/AddFees`, feeData);
            if (response.status === 200 || response.status === 201) {
                toast.success("Fee Added Successfully!");
                sendWhatsAppMessage(feeData); // Trigger WhatsApp Message
                setAmount("");
                setFeeMonth("");
                setPreviousDues("0");
                setTotalDues("0");
                setReceivedBy("");
                setSelectedStudent("");
                setWhatsappNumber("");
                fetchAllFees();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Error adding fee"); 
        }
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm("Delete record?")) return;
        try {
            await axios.put(`${BASE_URL}/DeleteFee/${id}`);
            fetchAllFees();
            toast.info("Deleted");
        } catch (err) { console.error(err); }
    };

    const handleEditFee = async (fee) => {
        const newAmt = prompt("New Amount Paid:", fee.amount);
        if (newAmt === null || newAmt === "") return;
        
        const updatedAmount = Number(newAmt);
        const balance = (Number(fee.previousDues) || 0) - updatedAmount;
        const updatedTotalDues = balance <= 0 ? "0" : `-${balance}`;

        try {
            await axios.put(`${BASE_URL}/EditFee/${fee._id}`, { 
                amount: updatedAmount,
                totalDues: updatedTotalDues 
            });
            fetchAllFees();
            toast.success("Updated");
        } catch (err) { console.error(err); }
    };

    const downloadReceipt = (fee) => {
        const doc = new jsPDF({ unit: "mm", format: [80, 150] });
        const centerX = 40;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(schoolName.toUpperCase(), centerX, 12, { align: "center" });
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Official Fee Payment Receipt", centerX, 18, { align: "center" });
        
        doc.setLineWidth(0.5);
        doc.line(5, 22, 75, 22);

        autoTable(doc, {
            startY: 25,
            theme: 'grid',
            margin: { left: 5, right: 5 },
            styles: { fontSize: 8, cellPadding: 1.5, lineColor: [0, 0, 0] },
            columnStyles: { 0: { fontStyle: 'bold', width: 28 }, 1: { width: 42 } },
            body: [
                ["Receipt No:", fee._id.substring(fee._id.length - 6).toUpperCase()],
                ["Date:", new Date(fee.date).toLocaleDateString()],
                ["Student:", fee.studentName],
                ["Father Name:", fee.fatherName || "-"],
                ["Class:", fee.className],
                ["Fee Month:", fee.feeMonth],
                ["Previous Dues:", `Rs. ${fee.previousDues || 0}`],
                ["Amount Paid:", `Rs. ${fee.amount}`],
                ["Total Balance:", `Rs. ${fee.totalDues || 0}`],
                ["Collector:", fee.receivedBy]
            ],
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setDrawColor(220, 20, 60);
        doc.setLineWidth(1);
        doc.rect(10, finalY, 60, 20, 'D');

        doc.setTextColor(220, 20, 60);
        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.text("PAID", centerX, finalY + 13, { align: "center", angle: 5 });
        
        doc.setTextColor(100);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for your payment!", centerX, finalY + 28, { align: "center" });
        doc.text("This is a computer generated receipt.", centerX, finalY + 31, { align: "center" });

        doc.save(`Receipt_${fee.studentName}.pdf`);
    };

    const downloadMonthlyPDF = (className, monthName, fees) => {
        const doc = new jsPDF();
        doc.text(`Fee Report: ${className} (${monthName})`, 14, 15);
        const tableColumn = ["#", "Student", "Father", "Month", "Prev Dues", "Paid", "Balance", "Collector"];
        const tableRows = fees.map((f, i) => [
            i + 1, f.studentName, f.fatherName || "-", f.feeMonth || "-", `Rs. ${f.previousDues || 0}`, `Rs. ${f.amount}`, `Rs. ${f.totalDues || 0}`, f.receivedBy || "-"
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save(`Fees_${className}_${monthName}.pdf`);
    };

    const filteredGroupedFees = useMemo(() => {
        return feesList.reduce((acc, fee) => {
            const className = fee.className || "Unassigned";
            const monthYear = new Date(fee.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (filterClass !== "All" && className !== filterClass) return acc;
            if (filterMonth !== "All" && monthYear !== filterMonth) return acc;
            if (!acc[className]) acc[className] = {};
            if (!acc[className][monthYear]) acc[className][monthYear] = [];
            acc[className][monthYear].push(fee);
            return acc;
        }, {});
    }, [feesList, filterMonth, filterClass]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 35 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>Fees Portal</Typography>
            </Stack>
            
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 5, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField select label="Class" value={selectedClass} fullWidth onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(""); }}>
                            {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField select label="Student" value={selectedStudent} fullWidth disabled={!selectedClass} onChange={(e) => handleStudentChange(e.target.value)}>
                            {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Father Name" value={fatherName} fullWidth onChange={(e) => setFatherName(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Fee Month" placeholder="e.g. May 2026" value={feeMonth} fullWidth onChange={(e) => setFeeMonth(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField label="Prev Dues" type="number" value={previousDues} fullWidth onChange={(e) => setPreviousDues(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Amount Paid" type="number" value={amount} fullWidth onChange={(e) => setAmount(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Auto Balance" value={totalDues} fullWidth InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField label="WhatsApp Number" placeholder="923000000000" value={whatsappNumber} fullWidth onChange={(e) => setWhatsappNumber(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Received By" value={receivedBy} fullWidth onChange={(e) => setReceivedBy(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField label="Date" type="date" value={date} fullWidth InputLabelProps={{ shrink: true }} onChange={(e) => setDate(e.target.value)} />
                    </Grid>
                </Grid>
                <Button variant="contained" onClick={handleAddFee} sx={{ mt: 3, px: 5, py: 1.5, fontWeight: 700 }}>Submit Fee</Button>
            </Paper>

            {Object.entries(filteredGroupedFees).map(([className, months]) => (
                <Box key={className} sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>{className}</Typography>
                    {Object.entries(months).map(([month, fees]) => (
                        <Paper key={month} sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{month}</Typography>
                                <Button size="small" startIcon={<DownloadIcon />} onClick={() => downloadMonthlyPDF(className, month, fees)}>Monthly Report</Button>
                            </Stack>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student</TableCell>
                                            <TableCell>Month</TableCell>
                                            <TableCell>Prev Dues</TableCell>
                                            <TableCell>Paid</TableCell>
                                            <TableCell>Balance</TableCell>
                                            <TableCell>Collector</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fees.map((f) => {
                                            const balanceValue = f.totalDues === "0" ? 0 : parseFloat(f.totalDues);
                                            return (
                                                <TableRow key={f._id}>
                                                    <TableCell sx={{ fontWeight: 600 }}>{f.studentName}</TableCell>
                                                    <TableCell>{f.feeMonth || "-"}</TableCell>
                                                    <TableCell sx={{ color: 'orange' }}>Rs. {f.previousDues || 0}</TableCell>
                                                    <TableCell sx={{ color: 'green', fontWeight: 700 }}>Rs. {f.amount}</TableCell>
                                                    <TableCell sx={{ 
                                                        color: balanceValue === 0 ? 'green' : 'red', 
                                                        fontWeight: 700 
                                                    }}>
                                                        Rs. {f.totalDues || 0}
                                                    </TableCell>
                                                    <TableCell>{f.receivedBy || "-"}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={() => downloadReceipt(f)} size="small"><PrintIcon color="success" /></IconButton>
                                                        <IconButton onClick={() => handleEditFee(f)} size="small"><EditIcon color="primary" /></IconButton>
                                                        <IconButton onClick={() => handleDeleteFee(f._id)} size="small"><DeleteIcon color="error" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ))}
                </Box>
            ))}
            <ToastContainer position="bottom-center" theme="colored" />
        </Box>
    );
};

export default AddFees;