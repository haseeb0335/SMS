import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import {
    Paper, Box, IconButton, Typography, Container, 
    CircularProgress, Stack, Tooltip
} from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';

// Global Shared System Templates & Core Buttons
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 100, align: 'center' },
        { id: 'sclassName', label: 'Class Allocation', minWidth: 170 },
    ];

    const subjectRows = subjectsList?.map((subject) => {
        return {
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject.sclassName?.sclassName || "Not Assigned",
            sclassID: subject.sclassName?._id || "",
            id: subject._id,
        };
    }) || [];

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                <Tooltip title="Delete Subject">
                    <IconButton 
                        onClick={() => deleteHandler(row.id, "Subject")}
                        size="small"
                        sx={{ 
                            color: '#ef4444', 
                            p: 1,
                            borderRadius: '10px',
                            '&:hover': { backgroundColor: '#fee2e2' } 
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <BlueButton 
                    variant="contained"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                    sx={{ 
                        borderRadius: '10px', 
                        textTransform: 'none',
                        boxShadow: 'none',
                        fontWeight: 600,
                        padding: '6px 16px',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                    }}
                >
                    View
                </BlueButton>
            </Stack>
        );
    };

    const actions = [
        {
            icon: <PostAddIcon color="primary" />, 
            name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />, 
            name: 'Flush All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    if (error) {
        console.error("Subject Directory Pipeline Stack Trace:", error);
    }

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 4 }, mb: 4, px: { xs: 1.5, sm: 3 } }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={48} thickness={4.5} sx={{ color: '#3b82f6' }} />
                </Box>
            ) : (
                <>
                    {/* Header Viewport Block */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                        spacing={2}
                        sx={{ mb: 4 }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                                Subject Directory
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
                                Complete overview of institutional academic curriculum registry and session bounds.
                            </Typography>
                        </Box>
                        {response && (
                            <GreenButton 
                                variant="contained"
                                startIcon={<PostAddIcon />}
                                onClick={() => navigate("/Admin/subjects/chooseclass")}
                                sx={{ borderRadius: '12px', px: 3, py: 1.2, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
                            >
                                Add Subjects
                            </GreenButton>
                        )}
                    </Stack>

                    {/* Conditional Database Matrix Frame */}
                    {response ? (
                        <StyledPaper variant="outlined">
                            <Box sx={{ p: { xs: 6, md: 10 }, textAlign: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="700" color="#64748b" mb={1}>
                                    No Subject Entities Found
                                </Typography>
                                <Typography variant="body2" color="#94a3b8">
                                    The global dictionary returned zero active subject registrations for this profile.
                                </Typography>
                            </Box>
                        </StyledPaper>
                    ) : (
                        <StyledPaper variant="outlined">
                            {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                                <TableTemplate 
                                    buttonHaver={SubjectsButtonHaver} 
                                    columns={subjectColumns} 
                                    rows={subjectRows} 
                                />
                            ) : (
                                <Box sx={{ p: { xs: 6, md: 10 }, textAlign: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight="700" color="#64748b" mb={1}>
                                        No Subjects Available
                                    </Typography>
                                    <Typography variant="body2" color="#94a3b8">
                                        There are currently no rows populated inside this academic branch.
                                    </Typography>
                                </Box>
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </StyledPaper>
                    )}
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

/* --- SYSTEM NATIVE HOISTED CORE STYLING WRAPPER --- */

const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    overflowX: 'auto',
    borderRadius: '24px',
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    backgroundColor: '#ffffff',
    position: 'relative',

    /* Internal Template Injections styling hooks */
    '& .MuiTableCell-head': {
        backgroundColor: '#f8fafc',
        color: '#475569',
        fontWeight: 800,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '20px',
        borderBottom: '2px solid #e2e8f0',
    },

    '& .MuiTableCell-body': {
        padding: '16px 20px',
        color: '#334155',
        fontSize: '0.9rem',
        fontWeight: 500,
        borderBottom: '1px solid #f1f5f9',
    },

    '& .MuiTableRow-root': {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: '#f8fafc !important',
        },
    },

    /* Primary Data Index Highlight */
    '& .MuiTableCell-body:first-of-type': {
        fontWeight: 700,
        color: '#0f172a',
    },
}));

export default ShowSubjects;