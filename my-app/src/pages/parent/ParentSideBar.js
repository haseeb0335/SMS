import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Divider, List } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";

import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InsightsIcon from '@mui/icons-material/Insights';
import EventNoteIcon from '@mui/icons-material/EventNote';

import { authLogout } from '../../redux/userRelated/userSlice';

// FIX: Destructure the closeDrawer callback prop coming from ParentDashboard
const ParentSideBar = ({ closeDrawer }) => {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const studentId = currentUser?.studentId;

    // Helper handler function to run both navigation routing and structural drawer closing
    const handleNavigation = () => {
        if (closeDrawer) {
            closeDrawer();
        }
    };

    return (
        <List
            sx={{
                bgcolor: 'background.paper',
                // Removed harsh 100vh layouts to allow pristine native overlay rendering
            }}
        >
            {/* Child Analytics */}
<ListItemButton 
    component={Link} 
    to="analytics"
    onClick={handleNavigation}
>
    <ListItemIcon>
        <AssessmentIcon
            color={location.pathname.includes("analytics")  ? 'primary' : 'inherit'}
        />
    </ListItemIcon>
    <ListItemText primary="Child Analytics" />
</ListItemButton>

          {/* Performance Report */}
<ListItemButton 
    component={Link} 
    // FIX: Changed "studentreport" to "/Parent/dashboard/studentreport" 
    // to guarantee it targets the correct path from anywhere in the app
    to="studentreport"
    onClick={handleNavigation}
>
    <ListItemIcon>
        <InsightsIcon
            color={location.pathname.includes("studentreport") ? 'primary' : 'inherit'}
        />
    </ListItemIcon>
    <ListItemText primary="Student Report" sx={{ textTransform: 'capitalize' }} />
</ListItemButton>

            {/* Apply Leave */}
            <ListItemButton 
                component={Link} 
                to="apply-leave"
                onClick={handleNavigation}
            >
                <ListItemIcon>
                    <EventNoteIcon
                        color={location.pathname.includes("apply-leave") ? 'primary' : 'inherit'}
                    />
                </ListItemIcon>
                <ListItemText primary="Apply Leave" />
            </ListItemButton>

            {/* Parent Profile */}
            <ListItemButton 
                component={Link} 
                to="profile"
                onClick={handleNavigation}
            >
                <ListItemIcon>
                    <AccountCircleIcon
                        color={location.pathname.includes("profile") ? 'primary' : 'inherit'}
                    />
                </ListItemIcon>
                <ListItemText primary="Profile" sx={{ textTransform: 'capitalize' }} />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {/* Logout */}
            <ListItemButton 
                component={Link} 
                to="logout"
                onClick={handleNavigation}
            >
                <ListItemIcon>
                    <ExitToAppIcon 
                        color={location.pathname.includes("logout") ? 'primary' : 'inherit'} 
                    />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ textTransform: 'capitalize' }} />
            </ListItemButton>

        </List>
    );
};

export default ParentSideBar;