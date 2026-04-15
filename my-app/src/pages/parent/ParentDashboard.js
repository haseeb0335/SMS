import { useState } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PaymentsIcon from "@mui/icons-material/Payments";

import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { AppBar, Drawer } from "../../components/styles";
import AccountMenu from "../../components/AccountMenu";

import ParentSideBar from "./ParentSideBar";
import ParentAnalytics from "./ParentAnalytics";
import ParentProfile from "./ParentProfile";
import ParentViewStudent from "./ParentViewStudent";
import ParentApplyLeave from "./ParentApplyLeave";
import StudentFees from "../student/StudentFees"; // Import the StudentFees component
import Logout from "../Logout";

const ParentDashboard = () => {

  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const { currentUser } = useSelector((state) => state.user);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TOP NAVBAR */}
      <AppBar open={open} position="absolute">
        <Toolbar sx={{ pr: "24px" }}>
          
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Parent Dashboard
          </Typography>

          {/* Profile Menu */}
          <AccountMenu profilePic={currentUser?.profilePic} />
        </Toolbar>
      </AppBar>

      {/* SIDEBAR DRAWER */}
      <Drawer
        variant="permanent"
        open={open}
        sx={open ? styles.drawerStyled : styles.hideDrawer}
      >
        <Toolbar sx={styles.toolBarStyled}>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider />

        <List component="nav">
          <ParentSideBar />
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={styles.boxStyled}>
        <Toolbar />

        <Routes>
                    {/* Matches /Parent/dashboard */}
                    <Route index element={<ParentAnalytics />} />
                    
                    {/* Matches /Parent/dashboard/analytics */}
                    <Route path="analytics" element={<ParentAnalytics />} />
                    
                    {/* Matches /Parent/dashboard/profile */}
                    <Route path="profile" element={<ParentProfile />} />
                    <Route path="studentreport" element={<ParentViewStudent />} />
                    <Route path="/Student/fees" element={<StudentFees />} />
                    <Route path="apply-leave" element={<ParentApplyLeave />} />
                    <Route path="logout" element={<Logout />} />
                    
                    {/* Redirect back to analytics if route not found */}
                    <Route path="*" element={<Navigate to="/Parent/dashboard" />} />
                </Routes>
      </Box>
    </Box>
  );
};

export default ParentDashboard;

const styles = {
  boxStyled: {
    backgroundColor: (theme) =>
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[900],
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },

  toolBarStyled: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    px: [1],
  },

  drawerStyled: {
    display: "flex",
  },

  hideDrawer: {
    display: "flex",
    "@media (max-width: 600px)": {
      display: "none",
    },
  },
};