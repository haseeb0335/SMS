import React, { useState } from "react";
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material";

import { Settings, Logout } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const AccountMenu = () => {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { currentRole, currentUser } = useSelector((state) => state.user);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const avatarSrc = currentUser?.profilePic || "";
  const avatarLetter = currentUser?.name?.charAt(0)?.toUpperCase() || "";

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Account settings">
          <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>

            {/* NAVBAR AVATAR */}
            <Avatar
              src={avatarSrc}
              key={avatarSrc}   // forces re-render when profilePic changes
              sx={{ width: 34, height: 34 }}
            >
              {!avatarSrc && avatarLetter}
            </Avatar>

          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: styles.styledPaper
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >

        {/* PROFILE INFO */}
        <MenuItem>

          <Avatar
            src={avatarSrc}
            key={avatarSrc + "menu"}
          >
            {!avatarSrc && avatarLetter}
          </Avatar>

          <Box>
            <Typography fontWeight="bold">
              {currentUser?.name}
            </Typography>

            <Link
              to={`/${currentRole}/profile`}
              style={{
                textDecoration: "none",
                color: "#555",
                fontSize: "13px"
              }}
            >
              View Profile
            </Link>
          </Box>

        </MenuItem>

        <Divider />

        {/* SETTINGS */}
        <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        {/* LOGOUT */}
        <MenuItem>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>

          <Link
            to="/logout"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Logout
          </Link>
        </MenuItem>

      </Menu>
    </>
  );
};

export default AccountMenu;

const styles = {
  styledPaper: {
    overflow: "visible",
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    mt: 1.5,

    "& .MuiAvatar-root": {
      width: 34,
      height: 34,
      ml: -0.5,
      mr: 1
    },

    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: "background.paper",
      transform: "translateY(-50%) rotate(45deg)",
      zIndex: 0
    }
  }
};