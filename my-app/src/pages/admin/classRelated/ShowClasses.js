import { useEffect, useState } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip, Typography, Paper } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';

import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import styled from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowClasses = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    const adminID = currentUser._id

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = async (deleteID, address) => {
        try {
            dispatch(deleteUser(deleteID, address));
            setMessage("Deleted Successfully");
            setShowPopup(true);
            dispatch(getAllSclasses(adminID, "Sclass")); 
        } catch (err) {
            setMessage("Delete failed");
            setShowPopup(true);
        }
    };

    const sclassColumns = [
        { id: 'name', label: 'Class Name', minWidth: 170 },
    ]

    const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => {
        return {
            name: sclass.sclassName,
            id: sclass._id,
        };
    })

    const SclassButtonHaver = ({ row }) => {
        const actions = [
            { icon: <PostAddIcon fontSize="small" color="primary" />, name: 'Add Subjects', action: () => navigate("/Admin/addsubject/" + row.id) },
            { icon: <PersonAddAlt1Icon fontSize="small" color="primary" />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
        ];
        return (
            <ButtonContainer>
                <IconButton onClick={() => deleteHandler(row.id, "Sclass")} size="small">
                    <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                </IconButton>
                <BlueButton 
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: '6px', textTransform: 'none', px: 2, fontSize: '0.8rem' }}
                    onClick={() => navigate("/Admin/classes/class/" + row.id)}>
                    View
                </BlueButton>
                <ActionMenu actions={actions} />
            </ButtonContainer>
        );
    };

    const ActionMenu = ({ actions }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);
        const handleClick = (event) => { setAnchorEl(event.currentTarget); };
        const handleClose = () => { setAnchorEl(null); };

        return (
            <>
                <Tooltip title="Manage">
                    <IconButton onClick={handleClick} size="small" sx={styles.actionIconButton}>
                        <SpeedDialIcon sx={{ fontSize: '16px', color: '#6366f1' }} />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{ elevation: 0, sx: styles.styledPaper }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {actions.map((action, index) => (
                        <MenuItem key={index} onClick={() => { action.action(); handleClose(); }}>
                            <ListItemIcon>{action.icon}</ListItemIcon>
                            <Typography variant="body2">{action.name}</Typography>
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    }

    const speedDialActions = [
        { icon: <AddCardIcon color="primary" />, name: 'Add New Class', action: () => navigate("/Admin/addclass") },
        { icon: <DeleteIcon color="error" />, name: 'Delete All Classes', action: () => deleteHandler(adminID, "Sclasses") },
    ];

    return (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#1e293b', fontWeight: 500 }}>
                Classes
            </Typography>

            {loading ? (
                <Typography sx={{ color: '#64748b' }}>Loading...</Typography>
            ) : (
                <>
                    {getresponse ? (
                        <Box sx={{ textAlign: 'center', mt: 10 }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                                Add Class
                            </GreenButton>
                        </Box>
                    ) : (
                        /* --- NEW COLOR THEMED TABLE WRAPPER --- */
                        <TableWrapper elevation={0}>
                            {Array.isArray(sclassesList) && sclassesList.length > 0 &&
                                <TableTemplate 
                                    buttonHaver={SclassButtonHaver} 
                                    columns={sclassColumns} 
                                    rows={sclassRows} 
                                />
                            }
                        </TableWrapper>
                    )}
                    <SpeedDialTemplate actions={speedDialActions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowClasses;

/* --- MODERN COLORED THEME STYLES --- */

const TableWrapper = styled(Paper)`
  border-radius: 12px !important;
  border: 1px solid #eef2f6 !important;
  overflow: hidden;
  background: #ffffff !important;

  /* This targets the internal MUI Table parts if TableTemplate uses them */
  & thead th {
    background-color: #7ebaf7 !important; /* Soft Slate Header */
    color: #050505 !important;
    font-weight: 600 !important;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0 !important;
  }

  & tbody tr:hover {
    background-color: #f1f5f9 !important; /* Hover effect */
  }

  & tbody td {
    color: #1e293b !important;
    border-bottom: 1px solid #f1f5f9 !important;
  }
`;

const styles = {
    actionIconButton: {
        ml: 1,
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        '&:hover': { backgroundColor: '#f8fafc' }
    },
    styledPaper: {
        filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))',
        mt: 1,
        borderRadius: '10px',
        border: '1px solid #eef2f6',
        minWidth: '160px',
    }
}

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
`;