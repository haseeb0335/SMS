import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTeachers } from "../../../redux/teacherRelated/teacherHandle";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast, { Toaster } from "react-hot-toast";
import {
  Paper, Typography, TextField, Button, Box, Table, TableHead, 
  TableRow, TableCell, TableBody, IconButton, MenuItem, Autocomplete,
  Grid, Stack, Accordion, AccordionSummary, AccordionDetails,
  Chip, useTheme, useMediaQuery, TableContainer
} from "@mui/material";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const AddTeacherSalary = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { teachersList } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    teacherId: "",
    teacherName: "",
    month: "",
    year: new Date().getFullYear().toString(),
    amount: "",
    whatsappNumber: "", // New WhatsApp Field
    date: new Date().toISOString().split('T')[0]
  });

  const [salaryRecords, setSalaryRecords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  // const BASE_URL = "https://sms-xi-rose.vercel.app";
  const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5001";

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllTeachers(currentUser._id));
      fetchAllSalaries();
    }
  }, [dispatch, currentUser?._id]);

  const fetchAllSalaries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/AllSalaries/${currentUser._id}`);
      setSalaryRecords(res.data);
    } catch (err) {
      console.error("Error fetching salaries:", err);
    }
  };

  // WhatsApp Logic
  const sendWhatsAppMessage = (data) => {
    if (!data.whatsappNumber) return;

    const message = `*SALARY DISBURSEMENT: ${currentUser?.schoolName || "School System"}*%0A%0A` +
      `*Teacher:* ${data.teacherName}%0A` +
      `*Month/Year:* ${data.month} ${data.year}%0A` +
      `*Amount Paid:* Rs. ${data.amount}%0A` +
      `*Date:* ${new Date(data.date).toLocaleDateString()}%0A%0A` +
      `Your salary has been successfully processed. Thank you!`;

    const whatsappUrl = `https://wa.me/${data.whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const downloadMonthlyPDF = (groupKey, records) => {
    const doc = new jsPDF();
    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210);
    doc.text("Teacher Salary Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${groupKey}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);

    const tableColumn = ["#", "Teacher Name", "Payment Date", "Amount (Rs)"];
    const tableRows = records.map((r, i) => [
      i + 1,
      r.teacherName,
      new Date(r.date).toLocaleDateString(),
      `Rs. ${r.amount}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      foot: [['', '', 'Total Distributed:', `Rs. ${total}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    doc.save(`Salary_Report_${groupKey.replace(' ', '_')}.pdf`);
    toast.success("PDF exported successfully");
  };

  const handleTeacherChange = (event, newValue) => {
    if (newValue) {
      setFormData({ ...formData, teacherId: newValue._id, teacherName: newValue.name });
    } else {
      setFormData({ ...formData, teacherId: "", teacherName: "" });
    }
  };

  const handleSave = async () => {
    if (!formData.teacherId || !formData.amount || !formData.month) {
        toast.error("Please fill required fields");
        return;
    }

    const isDuplicate = salaryRecords.find(record => 
      record.teacherId === formData.teacherId && 
      record.month === formData.month && 
      record.year === formData.year &&
      record._id !== currentRecordId
    );

    if (isDuplicate) {
      toast.error(`Entry already exists for ${formData.teacherName}`);
      return;
    }

    const savePromise = isEditing 
      ? axios.put(`${BASE_URL}/EditSalary/${currentRecordId}`, formData)
      : axios.post(`${BASE_URL}/AddSalary`, { ...formData, schoolId: currentUser._id });

    toast.promise(savePromise, {
      loading: 'Saving changes...',
      success: () => {
        sendWhatsAppMessage(formData); // Auto-send WhatsApp on success
        setIsEditing(false);
        setCurrentRecordId(null);
        setFormData({ 
            teacherId: "", 
            teacherName: "", 
            month: "", 
            year: new Date().getFullYear().toString(), 
            amount: "", 
            whatsappNumber: "",
            date: new Date().toISOString().split('T')[0] 
        });
        fetchAllSalaries();
        return "Database updated successfully";
      },
      error: "Could not save record",
    });
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
          Delete this record?
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            size="small" 
            variant="contained"
            sx={{ 
              bgcolor: '#ef4444', 
              color: '#fff', 
              '&:hover': { bgcolor: '#b91c1c' },
              fontWeight: 'bold', textTransform: 'none', fontSize: '11px', borderRadius: '6px'
            }}
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${BASE_URL}/DeleteSalary/${id}`);
                fetchAllSalaries();
                toast.success("Deleted successfully");
              } catch (err) {
                toast.error("Delete failed");
              }
            }}
          >
            Delete
          </Button>
          <Button 
            size="small" 
            sx={{ color: '#cbd5e1', textTransform: 'none', fontSize: '11px' }} 
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    ), { 
      duration: 5000,
      style: { background: '#0f172a', border: '1px solid #334155' } 
    });
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const groupedSalaries = salaryRecords.reduce((acc, curr) => {
    const key = `${curr.month} ${curr.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-right" />
      
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} xl={11}>
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', mb: 4 }} elevation={0} variant="outlined">
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: '12px', display: 'flex' }}>
                <AccountBalanceWalletIcon sx={{ color: '#fff' }} fontSize="medium" />
              </Box>
              <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>Salary Portal</Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={10}>
                <Autocomplete
                  options={teachersList || []}
                  getOptionLabel={(option) => option.name || ""}
                  value={teachersList?.find(t => t._id === formData.teacherId) || null}
                  onChange={handleTeacherChange}
                  renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Search Teacher by Name" 
                        variant="outlined" 
                        fullWidth 
                        placeholder="Type teacher's full name..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <TextField select label="Payment Month" name="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} fullWidth>
                  {months.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6} lg={2}>
                <TextField label="Year" name="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} fullWidth />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <TextField label="Amount (Rs)" type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} fullWidth />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <TextField label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} fullWidth placeholder="e.g. 923001234567" />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <TextField type="date" label="Payment Date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleSave} 
                    sx={{ py: 2, px: 10, borderRadius: '12px', fontWeight: 'bold', textTransform: 'none', boxShadow: 3 }}
                >
                  {isEditing ? "Save Changes" : "Confirm Salary"}
                </Button>
                {isEditing && (
                   <Button 
                    variant="outlined"
                    color="inherit" 
                    sx={{ ml: 2, py: 2, px: 4, borderRadius: '12px', textTransform: 'none' }} 
                    onClick={() => { setIsEditing(false); setFormData({ teacherId: "", teacherName: "", month: "", year: new Date().getFullYear().toString(), amount: "", whatsappNumber: "", date: new Date().toISOString().split('T')[0] }); }}
                   >
                   Cancel Edit
                 </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} xl={11}>
          <Typography variant="h5" fontWeight="800" mb={3} sx={{ color: '#1e293b' }}>Payment Logs</Typography>
          
          {Object.entries(groupedSalaries).reverse().map(([groupKey, records]) => (
            <Accordion key={groupKey} sx={{ mb: 2, borderRadius: '16px !important', '&:before': { display: 'none' } }} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <CalendarMonthIcon color="primary" />
                  <Typography fontWeight="700" sx={{ flexGrow: 1 }}>{groupKey}</Typography>
                  <Button 
                    size="small" 
                    startIcon={<PictureAsPdfIcon />} 
                    color="error" 
                    onClick={(e) => { e.stopPropagation(); downloadMonthlyPDF(groupKey, records); }}
                    sx={{ mr: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    PDF Report
                  </Button>
                  <Chip label={`Total: Rs. ${records.reduce((s, r) => s + Number(r.amount), 0)}`} color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.map((r) => (
                        <TableRow key={r._id} hover>
                          <TableCell><PersonIcon fontSize="inherit" sx={{ mr: 1, color: 'primary.main' }} />{r.teacherName}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#059669' }}>Rs. {r.amount}</TableCell>
                          <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => { setIsEditing(true); setCurrentRecordId(r._id); setFormData({...r, date: r.date.split('T')[0]}); window.scrollTo({top: 0, behavior: 'smooth'}); }} color="primary"><EditIcon fontSize="small" /></IconButton>
                            <IconButton onClick={() => handleDelete(r._id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddTeacherSalary;