import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Typography, Container, 
    CircularProgress, Stack, Tooltip
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry, the delete function has been disabled for now.")
        setShowPopup(true)
    }

    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 100, align: 'center' },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ]

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
            <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title="Delete">
                    <IconButton 
                        onClick={() => deleteHandler(row.id, "Subject")}
                        sx={{ 
                            color: '#ef4444', 
                            '&:hover': { backgroundColor: '#fee2e2', borderRadius: '8px' } 
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
                        borderRadius: '8px', 
                        textTransform: 'none',
                        boxShadow: 'none',
                        padding: '6px 16px',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                    }}
                >
                    View
                </BlueButton>
            </Stack>
        );
    };

    const actions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={50} thickness={4} sx={{ color: '#6366f1' }} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                                Subject Directory
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
                                Overview of academic curriculum and session allocations.
                            </Typography>
                        </Box>
                        {response && (
                            <GreenButton 
                                variant="contained"
                                startIcon={<PostAddIcon />}
                                onClick={() => navigate("/Admin/subjects/chooseclass")}
                                sx={{ borderRadius: '10px', px: 3, py: 1, fontWeight: 600 }}
                            >
                                Add Subjects
                            </GreenButton>
                        )}
                    </Box>

                    {response ? (
                        <StyledPaper elevation={0}>
                            <Box sx={{ p: 10, textAlign: 'center' }}>
                                <Typography variant="h6" color="#94a3b8">
                                    No subjects found in the database.
                                </Typography>
                            </Box>
                        </StyledPaper>
                    ) : (
                        <StyledPaper elevation={0}>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 ? (
                                <TableTemplate 
                                    buttonHaver={SubjectsButtonHaver} 
                                    columns={subjectColumns} 
                                    rows={subjectRows} 
                                />
                            ) : (
                                <Box sx={{ p: 10, textAlign: 'center' }}>
                                    <Typography variant="h6" color="#94a3b8">
                                        No subjects available to display.
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

export default ShowSubjects;

/* --- MODERN TABLE STYLING --- */

const StyledPaper = styled(Paper)`
  width: 100%;
  overflow: hidden;
  border-radius: 20px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  background-color: #fff !important;

  /* This styles the internal MUI Table inside your TableTemplate */
  & .MuiTableCell-head {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 20px;
    border-bottom: 2px solid #e2e8f0;
  }

  & .MuiTableCell-body {
    padding: 18px 20px;
    color: #334155;
    font-size: 0.95rem;
    border-bottom: 1px solid #f1f5f9;
  }

  & .MuiTableRow-root {
    transition: all 0.2s ease;
    &:hover {
      background-color: #f1f5f9 !important;
      cursor: pointer;
    }
  }

  /* Optional: Making the first column bold */
  & .MuiTableCell-body:first-of-type {
    font-weight: 600;
    color: #1e293b;
  }
`;
