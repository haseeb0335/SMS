
import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Divider, List } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InsightsIcon from '@mui/icons-material/Insights';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authLogout } from '../../redux/userRelated/userSlice';
import PaymentsIcon from "@mui/icons-material/Payments";

const ParentSideBar = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Add this
    const dispatch = useDispatch(); // Add this

    const handleLogoutClick = () => {
        // Instead of navigating to a page, we just go straight to the logic
        // Or navigate specifically to the logout page
        navigate('/logout');
    };

    return (
        <List
            sx={{
                width: 240,
                bgcolor: 'background.paper',
                height: '100vh',
                borderRight: '1px solid #ddd'
            }}
        >

            {/* Child Analytics */}
            <ListItemButton component={Link} to="/Parent/analytics">
                <ListItemIcon>
                    <AssessmentIcon
                        color={location.pathname.includes("analytics") ? 'primary' : 'inherit'}
                    />
                </ListItemIcon>
                <ListItemText primary="Child Analytics" />
            </ListItemButton>


          {/* Performance Report */}
<ListItemButton component={Link} to="studentreport">
    <ListItemIcon>
        <InsightsIcon
            color={location.pathname.includes("studentreport") ? 'primary' : 'inherit'}
        />
    </ListItemIcon>
    <ListItemText primary="studentreport" />
</ListItemButton>

{/* Apply Leave - New Option */}
            <ListItemButton component={Link} to="apply-leave">
                <ListItemIcon>
                    <EventNoteIcon
                        color={location.pathname.includes("apply-leave") ? 'primary' : 'inherit'}
                    />
                </ListItemIcon>
                <ListItemText primary="Apply Leave" />
            </ListItemButton>

            {/* fees collection */}
              <ListItemButton component={Link} to="/Student/fees">
                <ListItemIcon><PaymentsIcon /></ListItemIcon>
                <ListItemText primary="My Fees" />
            </ListItemButton>

            {/* Parent Profile */}
            <ListItemButton component={Link} to="profile">
                <ListItemIcon>
                    <AccountCircleIcon
                        color={location.pathname.includes("profile") ? 'primary' : 'inherit'}
                    />
                </ListItemIcon>
                <ListItemText primary="profile" />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

     {/* Logout */}
<ListItemButton component={Link} to="logout">
    <ListItemIcon>
        <ExitToAppIcon color={location.pathname === "/logout" ? 'primary' : 'inherit'} />
    </ListItemIcon>
    <ListItemText primary="logout" />
</ListItemButton>

        </List>
    );
};

export default ParentSideBar;
