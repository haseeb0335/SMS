import * as React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import QuizIcon from "@mui/icons-material/Quiz";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import HowToRegIcon from "@mui/icons-material/HowToReg"; // New Icon for Self Attendance

const SideBar = () => {
  const location = useLocation();

  return (
    <>
      <React.Fragment>
        {/* Dashboard */}
        <ListItemButton
          component={Link}
          to="/Teacher/dashboard"
          selected={location.pathname === "/Teacher/dashboard"}
        >
          <ListItemIcon>
            <HomeIcon color={location.pathname === "/Teacher/dashboard" ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* My Class */}
        <ListItemButton
          component={Link}
          to="/Teacher/classes"
          selected={location.pathname.startsWith("/Teacher/classes")}
        >
          <ListItemIcon>
            <ClassOutlinedIcon color={location.pathname.startsWith("/Teacher/classes") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="My Class" />
        </ListItemButton>

        {/* Students */}
        <ListItemButton
          component={Link}
          to="/Teacher/students"
          selected={location.pathname.startsWith("/Teacher/students")}
        >
          <ListItemIcon>
            <PersonOutlineIcon color={location.pathname.startsWith("/Teacher/students") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Students" />
        </ListItemButton>

        {/* Student Attendance */}
        <ListItemButton
          component={Link}
          to="/Teacher/attendance"
          selected={location.pathname.startsWith("/Teacher/attendance")}
        >
          <ListItemIcon>
            <AssignmentIcon color={location.pathname.startsWith("/Teacher/attendance") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Student Attendance" />
        </ListItemButton>

        {/* Teacher Self Attendance */}
        <ListItemButton
          component={Link}
          to="/Teacher/self-attendance"
          selected={location.pathname.startsWith("/Teacher/self-attendance")}
        >
          <ListItemIcon>
            <HowToRegIcon color={location.pathname.startsWith("/Teacher/self-attendance") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="My Attendance" />
        </ListItemButton>

        {/* NEW: Test Section */}
        <ListItemButton
          component={Link}
          to="/Teacher/test"
          selected={location.pathname.startsWith("/Teacher/test")}
        >
          <ListItemIcon>
            <QuizIcon color={location.pathname.startsWith("/Teacher/test") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Test" />
        </ListItemButton>

        {/* Salary */}
        <ListItemButton
          component={Link}
          to="/Teacher/salary"
          selected={location.pathname.startsWith("/Teacher/salary")}
        >
          <ListItemIcon>
            <PaymentsIcon color={location.pathname.startsWith("/Teacher/salary") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Salary" />
        </ListItemButton>
      </React.Fragment>

      <Divider sx={{ my: 1 }} />

      <React.Fragment>
        <ListSubheader component="div" inset>User</ListSubheader>
        <ListItemButton
          component={Link}
          to="/Teacher/profile"
          selected={location.pathname.startsWith("/Teacher/profile")}
        >
          <ListItemIcon>
            <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Teacher/profile") ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>

        <ListItemButton component={Link} to="/logout">
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </React.Fragment>
    </>
  );
};

export default SideBar;