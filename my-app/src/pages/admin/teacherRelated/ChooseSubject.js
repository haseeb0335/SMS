import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Table, TableBody, TableContainer, TableHead, 
    Typography, Paper, Container, CircularProgress, 
    Stack, Divider, useTheme, useMediaQuery 
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import SubjectIcon from '@mui/icons-material/Subject';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styled from 'styled-components';

const ChooseSubject = ({ situation }) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [classID, setClassID] = useState("");
    const [teacherID, setTeacherID] = useState("");
    const [loader, setLoader] = useState(false);

    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

    useEffect(() => {
        if (situation === "Norm") {
            setClassID(params.id);
            dispatch(getTeacherFreeClassSubjects(params.id));
        }
        else if (situation === "Teacher") {
            const { classID, teacherID } = params;
            setClassID(classID);
            setTeacherID(teacherID);
            dispatch(getTeacherFreeClassSubjects(classID));
        }
    }, [situation, params.id, dispatch]);

    const updateSubjectHandler = (teacherId, teachSubject) => {
        setLoader(true);
        dispatch(updateTeachSubject(teacherId, teachSubject));
        navigate("/Admin/teachers");
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    if (response) {
        return (
            <Container maxWidth="md" sx={{ mt: 8 }}>
                <StyledEmptyState>
                    <ErrorOutlineIcon sx={{ fontSize: 80, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                        All Subjects Assigned
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                        It looks like all subjects in this class already have teachers assigned.
                    </Typography>
                    <PurpleButton 
                        variant="contained" 
                        onClick={() => navigate("/Admin/addsubject/" + classID)}
                        sx={{ borderRadius: '10px', px: 4 }}
                    >
                        Add New Subjects
                    </PurpleButton>
                </StyledEmptyState>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Choose Subject
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Select a subject to link with the selected instructor.
                </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <StyledPaper elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell sx={{ fontWeight: 700 }}>#</StyledTableCell>
                                <StyledTableCell align="center" sx={{ fontWeight: 700 }}>Subject Name</StyledTableCell>
                                <StyledTableCell align="center" sx={{ fontWeight: 700 }}>Subject Code</StyledTableCell>
                                <StyledTableCell align="center" sx={{ fontWeight: 700 }}>Actions</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                                subjectsList.map((subject, index) => (
                                    <StyledTableRow key={subject._id}>
                                        <StyledTableCell sx={{ fontWeight: 600, color: '#64748b' }}>
                                            {index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                                {!isMobile && <SubjectIcon sx={{ color: '#6366f1', fontSize: 20 }} />}
                                                <Typography sx={{ fontWeight: 600 }}>{subject.subName}</Typography>
                                            </Stack>
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            <Typography variant="body2" sx={{ bgcolor: '#f1f5f9', py: 0.5, px: 1, borderRadius: '6px', display: 'inline-block' }}>
                                                {subject.subCode}
                                            </Typography>
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {situation === "Norm" ? (
                                                <GreenButton 
                                                    variant="contained" 
                                                    onClick={() => navigate("/Admin/teachers/addteacher/" + subject._id)}
                                                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                                                >
                                                    Choose
                                                </GreenButton>
                                            ) : (
                                                <GreenButton 
                                                    variant="contained" 
                                                    disabled={loader}
                                                    onClick={() => updateSubjectHandler(teacherID, subject._id)}
                                                    sx={{ borderRadius: '8px', textTransform: 'none', minWidth: '100px' }}
                                                >
                                                    {loader ? <CircularProgress size={20} color="inherit" /> : 'Choose Sub'}
                                                </GreenButton>
                                            )}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))
                            ) : (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        No subjects available.
                                    </StyledTableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </Container>
    );
};

export default ChooseSubject;

/* Modern UI Styled Components */

const StyledPaper = styled(Paper)`
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff !important;
`;

const StyledEmptyState = styled(Paper)`
    padding: 60px 20px;
    text-align: center;
    border-radius: 20px;
    background-color: #f8fafc;
    border: 2px dashed #e2e8f0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;