import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { 
    Container, Paper, Table, TableBody, TableHead, Typography, 
    Box, Card, Grid, Chip, TableContainer, CircularProgress, Fade, Button 
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DownloadIcon from '@mui/icons-material/Download';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

// PDF Generation Imports
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    const [subjectMarks, setSubjectMarks] = useState([]);

    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails])

    useEffect(() => {
        if (subjectMarks.length === 0) {
            dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
        }
    }, [subjectMarks, dispatch, currentUser.sclassName._id]);

    // Total Calculation Logic
    const totalObtained = subjectMarks.reduce((acc, curr) => acc + (Number(curr.marksObtained) || 0), 0);
    const totalPossible = subjectMarks.length * 100; // Assuming each subject is out of 100

    // PDF Download Function
    const downloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Student Report Card", 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Student Name: ${userDetails?.name}`, 14, 30);
        doc.text(`Class: ${userDetails?.sclassName?.sclassName}`, 14, 37);
        doc.text(`Roll Number: ${userDetails?.rollNum}`, 14, 44);

        const tableData = subjectMarks.map(result => [
            result.subName.subName,
            `${result.marksObtained}/100`
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['Subject Name', 'Marks Obtained']],
            body: [
                ...tableData,
                [{ content: 'Total Marks', styles: { fontWeight: 'bold' } }, { content: `${totalObtained}/${totalPossible}`, styles: { fontWeight: 'bold' } }]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });

        doc.save(`${userDetails?.name}_Report.pdf`);
    };

    const renderTableSection = () => {
        return (
            <Fade in={true}>
                <Box sx={{ mt: 4, mb: 6 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h5" fontWeight="900" sx={{ color: '#1E293B' }}>
                                Academic Results
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Performance Overview
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            startIcon={<DownloadIcon />} 
                            onClick={downloadPDF}
                            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, bgcolor: '#0F172A', '&:hover': { bgcolor: '#334155' } }}
                        >
                            PDF
                        </Button>
                    </Box>

                    <TableContainer component={Paper} sx={{ borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Table size="medium">
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <StyledTableRow>
                                    <StyledTableCell sx={{ fontWeight: '800' }}>Subject</StyledTableCell>
                                    <StyledTableCell align="right" sx={{ fontWeight: '800' }}>Marks</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {subjectMarks.map((result, index) => {
                                    if (!result.subName || !result.marksObtained) return null;
                                    return (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell sx={{ fontWeight: 600 }}>{result.subName.subName}</StyledTableCell>
                                            <StyledTableCell align="right">
                                                <Typography fontWeight="700">{result.marksObtained}/100</Typography>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                                <StyledTableRow sx={{ bgcolor: '#F1F5F9' }}>
                                    <StyledTableCell sx={{ fontWeight: '900', fontSize: '1rem' }}>Grand Total</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Chip 
                                            label={`${totalObtained}/${totalPossible}`} 
                                            sx={{ bgcolor: '#0F172A', color: '#fff', fontWeight: '900' }} 
                                        />
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Fade>
        );
    };

    const renderClassDetailsSection = () => {
        return (
            <Container sx={{ py: 6, textAlign: 'center' }}>
                <Box sx={{ mb: 4 }}>
                    <LibraryBooksIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#0F172A' }}>Class Curriculum</Typography>
                    <Chip label={`Class ${sclassDetails?.sclassName}`} variant="outlined" sx={{ mt: 2, fontWeight: 'bold' }} />
                </Box>
                <Grid container spacing={2}>
                    {subjectsList && subjectsList.map((subject, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                <Typography variant="h6" fontWeight="800">{subject.subName}</Typography>
                                <Typography variant="caption">CODE: {subject.subCode}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    };

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress size={40} thickness={5} />
                </Box>
            ) : (
                <Container maxWidth="sm">
                    {subjectMarks && subjectMarks.length > 0
                        ? renderTableSection()
                        : renderClassDetailsSection()
                    }
                </Container>
            )}
        </Box>
    );
};

export default StudentSubjects;