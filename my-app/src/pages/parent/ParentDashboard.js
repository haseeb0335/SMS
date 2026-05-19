import { useState } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  Drawer as MuiDrawer
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { AppBar } from "../../components/styles";
import AccountMenu from "../../components/AccountMenu";

import ParentSideBar from "./ParentSideBar";
import ParentAnalytics from "./ParentAnalytics";
import ParentProfile from "./ParentProfile";
import ParentViewStudent from "./ParentViewStudent";
import ParentApplyLeave from "./ParentApplyLeave";

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
      {/* open={false} prevents the navbar width from shrinking or shifting when the overlay drawer opens */}
      <AppBar open={false} position="absolute">
        <Toolbar sx={{ pr: "24px" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{ marginRight: "36px" }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            Parent Dashboard
          </Typography>

          {/* Profile Menu */}
          <AccountMenu profilePic={currentUser?.profilePic} />
        </Toolbar>
      </AppBar>

      {/* SIDEBAR DRAWER (Slide-Over Overlay View) */}
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer} // Closes drawer cleanly when clicking dark backdrop mask area
        ModalProps={{
          keepMounted: true, // Optimized performance rendering for mobile frame response
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2, // Keeps overlay floating above the top header bar smoothly
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: "4px 0px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Toolbar sx={styles.toolBarStyled}>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider />

        {/* Clean wrapper passing down the toggle event callback instead of list bubbling */}
        <List component="nav">
          <ParentSideBar closeDrawer={toggleDrawer} />
        </List>
      </MuiDrawer>

      {/* MAIN CONTENT RUNTIME VIEWPORT */}
      <Box 
        component="main" 
        sx={{
          ...styles.boxStyled,
          width: "100%", // Retains full 100% width grid allocation so data charts never squeeze
        }}
      >
        <Toolbar />

        <Routes>
          {/* Matches /Parent/dashboard */}
          <Route index element={<ParentAnalytics />} />
          
          {/* Matches /Parent/dashboard/analytics */}
          <Route path="analytics" element={<ParentAnalytics />} />
          
          {/* Matches /Parent/dashboard/profile */}
          <Route path="profile" element={<ParentProfile />} />
          <Route path="studentreport" element={<ParentViewStudent />} />
          <Route path="apply-leave" element={<ParentApplyLeave />} />
          <Route path="logout" element={<Logout />} />
          
          {/* Fallback redirect strategy back to baseline analytics view */}
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
};