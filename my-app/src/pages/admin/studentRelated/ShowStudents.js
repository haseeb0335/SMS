import { useEffect, useState, useRef, Fragment, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle'; // ✅ ADDED

import {
    Paper, Box, IconButton, TextField, Typography, Container,
    CircularProgress, Divider, Stack, useTheme, useMediaQuery,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';

import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    // ✅ UPDATED DELETE HANDLER
    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            dispatch(deleteUser(deleteID, address))
                .then(() => {
                    setMessage("Student deleted successfully");
                    setShowPopup(true);
                    dispatch(getAllStudents(currentUser._id)); // refresh list
                })
                .catch(() => {
                    setMessage("Failed to delete student");
                    setShowPopup(true);
                });
        }
    };

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 150 },
        { id: 'rollNum', label: 'Roll No.', minWidth: 80 },
    ];

    // Group students by class
    const groupedStudents = useMemo(() => {
        if (!studentsList || studentsList.length === 0) return {};

        const filtered = studentsList.filter((student) =>
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.rollNum.toString().includes(search)
        );

        const groups = {};
        filtered.forEach((student) => {
           const className = student.sclassName?.sclassName || "Unassigned";
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
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                
                {/* ✅ DELETE BUTTON WORKING */}
                <IconButton size="small" onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon fontSize="small" color="error" />
                </IconButton>

                <BlueButton
                    variant="contained"
                    size="small"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </BlueButton>

                <Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} size="small">
                        <Button onClick={handleClick} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                            {options[selectedIndex]}
                        </Button>
                        <BlackButton size="small" onClick={() => setOpen((prev) => !prev)}>
                            {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                        </BlackButton>
                    </ButtonGroup>

                    <Popper sx={{ zIndex: 1 }} open={open} anchorEl={anchorRef.current} transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                                <Paper elevation={8}>
                                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                                        <MenuList autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={() => {
                                                        setSelectedIndex(index);
                                                        setOpen(false);
                                                    }}
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
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students', action: () => deleteHandler(currentUser._id, "Students") },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <>
                    {response ? (
                        <StyledEmptyState>
                            <Typography variant="h6">No Students Found</Typography>
                            <GreenButton onClick={() => navigate("/Admin/addstudents")}>
                                Add Students
                            </GreenButton>
                        </StyledEmptyState>
                    ) : (
                        <Box>

                            <TextField
                                size="small"
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            {Object.entries(groupedStudents).map(([className, students]) => (
                                <StyledAccordion key={className}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight="bold">
                                            {className} ({students.length})
                                        </Typography>
                                    </AccordionSummary>

                                    <AccordionDetails>
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

export default ShowStudents;

/* Styled Components */

const StyledAccordion = styled(Accordion)`
    margin-bottom: 12px !important;
`;

const StyledEmptyState = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 40vh;
`;
