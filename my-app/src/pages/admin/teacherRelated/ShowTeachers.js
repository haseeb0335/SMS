import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, TablePagination, Button, Box, IconButton, 
    Typography, Container, CircularProgress, Stack, Tooltip
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const ShowTeachers = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, error, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        setMessage("Sorry, the delete function has been disabled for now.")
        setShowPopup(true)
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 100 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = teachersList?.map((teacher) => {
        return {
            name: teacher.name,
            teachSubject: teacher.teachSubject?.subName || null,
            teachSclass: teacher.teachSclass.sclassName,
            teachSclassID: teacher.teachSclass._id,
            id: teacher._id,
        };
    }) || [];

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Teacher',
            action: () => navigate("/Admin/teachers/chooseclass")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={50} thickness={4} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Teachers
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Manage and view all faculty members
                            </Typography>
                        </Box>
                        {response && (
                            <GreenButton 
                                variant="contained" 
                                startIcon={<PersonAddAlt1Icon />}
                                onClick={() => navigate("/Admin/teachers/chooseclass")}
                                sx={{ borderRadius: '10px' }}
                            >
                                Add Teacher
                            </GreenButton>
                        )}
                    </Box>

                    <StyledPaper elevation={0}>
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <StyledTableRow>
                                        {columns.map((column) => (
                                            <StyledTableCell key={column.id} style={{ minWidth: column.minWidth, fontWeight: 700 }}>
                                                {column.label}
                                            </StyledTableCell>
                                        ))}
                                        <StyledTableCell align="center" style={{ fontWeight: 700 }}>
                                            Actions
                                        </StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {rows
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                <StyledTableCell>{row.name}</StyledTableCell>
                                                <StyledTableCell>
                                                    {row.teachSubject ? (
                                                        row.teachSubject
                                                    ) : (
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small"
                                                            onClick={() => navigate(`/Admin/teachers/choosesubject/${row.teachSclassID}/${row.id}`)}
                                                            sx={{ textTransform: 'none', borderRadius: '8px' }}
                                                        >
                                                            Add Subject
                                                        </Button>
                                                    )}
                                                </StyledTableCell>
                                                <StyledTableCell>{row.teachSclass}</StyledTableCell>
                                                <StyledTableCell align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="View Details">
                                                            <BlueButton 
                                                                variant="contained" 
                                                                size="small"
                                                                onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                                                                sx={{ borderRadius: '8px', minWidth: 'auto' }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </BlueButton>
                                                        </Tooltip>
                                                        <Tooltip title="Remove Teacher">
                                                            <IconButton onClick={() => deleteHandler(row.id, "Teacher")} sx={{ color: '#ff5252' }}>
                                                                <PersonRemoveIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </StyledPaper>
                </>
            )}
            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowTeachers;

const StyledPaper = styled(Paper)`
  width: 100%;
  overflow: hidden;
  border-radius: 16px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
`;
