import React, { useState } from "react";
import { PhotoCamera } from "@mui/icons-material";
import {
  Avatar,
  Button,
  TextField,
  Paper,
  IconButton,
  Box,
  Typography,
  Container,
  Stack,
  Divider
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/userRelated/userHandle";

const AdminProfile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || "");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || "");

  // ✅ Convert image to Base64
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const updatedData = {
      name,
      email,
      schoolName,
      password,
      profilePic
    };
    dispatch(updateUser(updatedData, currentUser._id, "Admin"));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 4, md: 8 }, mb: 4 }}>
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          textAlign: "center", 
          borderRadius: "24px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* Profile Picture Section */}
        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <Avatar
            src={profilePic}
            sx={{ 
              width: 140, 
              height: 140, 
              border: "4px solid #fff", 
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)" 
            }}
          />
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="upload-photo"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-photo">
            <IconButton
              component="span"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: (theme) => theme.palette.primary.main,
                color: "#fff",
                "&:hover": { background: (theme) => theme.palette.primary.dark },
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                p: 1
              }}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </label>
        </Box>

        <Typography variant="h5" fontWeight="800" sx={{ color: "#1e293b" }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Administrator Account
        </Typography>

        <Divider sx={{ mb: 4, opacity: 0.6 }} />

        {/* Form Section */}
        <Box component="form" onSubmit={submitHandler}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />

            <TextField
              fullWidth
              label="School Name"
              variant="outlined"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Enter school name"
            />

            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.com"
            />

            <TextField
              fullWidth
              type="password"
              label="Update Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ 
                mt: 2, 
                py: 1.8, 
                borderRadius: "12px", 
                fontWeight: "bold", 
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)"
              }}
            >
              Save Profile Changes
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminProfile;