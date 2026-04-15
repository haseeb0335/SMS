import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Typography, CircularProgress, Container, Stack
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import CampaignIcon from '@mui/icons-material/Campaign'; // Added for a modern header look
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

const ShowNotices = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            })
    }

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 200 },
        { id: 'date', label: 'Date', minWidth: 120 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    const NoticeButtonHaver = ({ row }) => {
        return (
            <IconButton onClick={() => deleteHandler(row.id, "Notice")}>
                <DeleteIcon color="error" />
            </IconButton>
        );
    };

    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {/* Header Section */}
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        spacing={2} 
                        sx={{ mb: 3 }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: '10px', display: 'flex' }}>
                                <CampaignIcon sx={{ color: '#fff' }} />
                            </Box>
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                                Notice Board
                            </Typography>
                        </Stack>
                        
                        {/* Show "Add Notice" button if list is empty or based on response */}
                        {response && (
                            <GreenButton 
                                variant="contained"
                                onClick={() => navigate("/Admin/addnotice")}
                                sx={{ borderRadius: '10px', px: 4 }}
                            >
                                Add New Notice
                            </GreenButton>
                        )}
                    </Stack>

                    {!response && (
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                width: '100%', 
                                overflow: 'hidden', 
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            {Array.isArray(noticesList) && noticesList.length > 0 ? (
                                <TableTemplate 
                                    buttonHaver={NoticeButtonHaver} 
                                    columns={noticeColumns} 
                                    rows={noticeRows} 
                                />
                            ) : (
                                <Box sx={{ p: 5, textAlign: 'center' }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No notices available.
                                    </Typography>
                                </Box>
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default ShowNotices;