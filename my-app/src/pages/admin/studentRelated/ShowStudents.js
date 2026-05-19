import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import {
    Paper, Box, IconButton, TextField, Typography, Container,
    CircularProgress, Stack, InputAdornment, Button, ButtonGroup,
    ClickAwayListener, Grow, Popper, MenuItem, MenuList, Tooltip,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

// Global System Redux Pipelines & Common Core Layout Elements
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to completely remove this student record?")) {
            dispatch(deleteUser(deleteID, address))
                .then(() => {
                    setMessage("Student record removed successfully");
                    setShowPopup(true);
                    dispatch(getAllStudents(currentUser._id));
                })
                .catch(() => {
                    setMessage("Failed to execute data purge on targeted record");
                    setShowPopup(true);
                });
        }
    };

    const studentColumns = [
        { id: 'name', label: 'Student Name', minWidth: 150 },
        { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    ];

    // Reactive Group Allocation Engine Matrix
    const groupedStudents = useMemo(() => {
        if (!studentsList || studentsList.length === 0) return {};

        const filtered = studentsList.filter((student) =>
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.rollNum.toString().includes(search)
        );

        const groups = {};
        filtered.forEach((student) => {
            const className = student.sclassName?.sclassName || "Unassigned Matrix";
            if (!groups[className]) {
                groups[className] = [];
            }
            groups[className].push({
                name: student.name,
                rollNum: student.rollNum,
                sclassName: student.sclassName?.sclassName,
                id: student._id,
            });
        });

        return Object.keys(groups)
            .sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, "")) || 0;
                const numB = parseInt(b.replace(/\D/g, "")) || 0;
                return numA - numB;
            })
            .reduce((acc, key) => {
                acc[key] = groups[key];
                return acc;
            }, {});
    }, [studentsList, search]);

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) navigate("/Admin/students/student/attendance/" + row.id);
            else if (selectedIndex === 1) navigate("/Admin/students/student/marks/" + row.id);
        };

        return (
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                <Tooltip title="Remove Record">
                    <IconButton 
                        size="small" 
                        onClick={() => deleteHandler(row.id, "Student")}
                        sx={{ color: '#ef4444', p: 1, borderRadius: '10px', '&:hover': { backgroundColor: '#fee2e2' } }}
                    >
                        <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <BlueButton
                    variant="contained"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                    sx={{ borderRadius: '10px', textTransform: 'none', boxShadow: 'none', fontWeight: 600 }}
                >
                    View
                </BlueButton>

                <Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} size="small" sx={{ boxShadow: 'none' }}>
                        <Button onClick={handleClick} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                            {options[selectedIndex]}
                        </Button>
                        <BlackButton 
                            size="small" 
                            onClick={() => setOpen((prev) => !prev)}
                            sx={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}
                        >
                            {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                        </BlackButton>
                    </ButtonGroup>

                    <Popper sx={{ zIndex: 10 }} open={open} anchorEl={anchorRef.current} transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                                <Paper sx={{ borderRadius: '12px', mt: 0.5, overflow: 'hidden', border: '1px solid #e2e8f0' }} elevation={4}>
                                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                                        <MenuList autoFocusItem id="split-button-menu">
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={() => {
                                                        setSelectedIndex(index);
                                                        setOpen(false);
                                                    }}
                                                    sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </Fragment>
            </Stack>
        );
    };

    const actions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student', action: () => navigate("/Admin/addstudents") },
        { icon: <PersonRemoveIcon color="error" />, name: 'Flush Student Records', action: () => deleteHandler(currentUser._id, "Students") },
    ];

    if (error) {
        console.error("Student Directory Core Pipeline Dump:", error);
    }

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 4 }, mb: 4, px: { xs: 1.5, sm: 3 } }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={48} thickness={4.5} sx={{ color: '#3b82f6' }} />
                </Box>
            ) : (
                <>
                    {response ? (
                        <StyledEmptyState>
                            <Typography variant="h6" fontWeight="700" color="#64748b" mb={2}>
                                No Student Records Initialized
                            </Typography>
                            <GreenButton 
                                variant="contained"
                                onClick={() => navigate("/Admin/addstudents")}
                                sx={{ borderRadius: '12px', textTransform: 'none', px: 3, boxShadow: 'none', fontWeight: 700 }}
                            >
                                Add Students
                            </GreenButton>
                        </StyledEmptyState>
                    ) : (
                        <Box>
                            {/* Header Panel Viewport and Search Bar Matrix */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                                spacing={2}
                                sx={{ mb: 4 }}
                            >
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                                        Student Directory
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
                                        Interactive catalog grouped by specific cohorts and administrative metrics.
                                    </Typography>
                                </Box>
                                
                                <TextField
                                    size="small"
                                    placeholder="Search by name or roll..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        width: { xs: '100%', sm: 320 },
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: '#ffffff',
                                            '& fieldset': { borderColor: '#e2e8f0' },
                                        }
                                    }}
                                />
                            </Stack>

                            {/* Collapsible Accordion Grid System Hooks */}
                            {Object.entries(groupedStudents).map(([className, students]) => (
                                <StyledAccordion key={className} disableGutters elevation={0}>
                                    <AccordionSummary 
                                        expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}
                                        sx={{ px: 3, py: 0.5 }}
                                    >
                                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>
                                            {className} <Box component="span" sx={{ color: '#3b82f6', ml: 0.5, fontWeight: 600 }}>({students.length})</Box>
                                        </Typography>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ p: 0, borderTop: '1px solid #f1f5f9' }}>
                                        <TableTemplate
                                            buttonHaver={StudentButtonHaver}
                                            columns={studentColumns}
                                            rows={students}
                                        />
                                    </AccordionDetails>
                                </StyledAccordion>
                            ))}

                            <SpeedDialTemplate actions={actions} />
                        </Box>
                    )}
                </>
            )}

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

/* --- SYSTEM NATIVE HOISTED CORE ARCHITECTURE OVERRIDES --- */

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginBottom: '16px',
    borderRadius: '20px !important',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    '&:before': { display: 'none' }, // Disables the standard built-in material divider line

    /* Injected inner target wrappers formatting directly into TableTemplate templates */
    '& .MuiTableCell-head': {
        backgroundColor: '#f8fafc',
        color: '#475569',
        fontWeight: 800,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '18px 24px',
        borderBottom: '2px solid #e2e8f0',
    },
    '& .MuiTableCell-body': {
        padding: '14px 24px',
        color: '#334155',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    '& .MuiTableCell-body:first-of-type': {
        fontWeight: 700,
        color: '#0f172a',
    }
}));

const StyledEmptyState = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    padding: '32px'
}));

export default ShowStudents;