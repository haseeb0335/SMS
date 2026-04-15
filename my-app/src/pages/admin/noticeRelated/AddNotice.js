import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { 
    CircularProgress, 
    Box, 
    TextField, 
    Typography, 
    Button, 
    Paper, 
    Stack, 
    Container 
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import Popup from '../../../components/Popup';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const adminID = currentUser._id

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = { title, details, date, adminID };
  const address = "Notice"

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices');
      dispatch(underControl())
    } else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box component="form" onSubmit={submitHandler}>
          <Stack spacing={3}>
            {/* Header Section */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: '12px', display: 'flex' }}>
                <CampaignIcon sx={{ color: '#fff' }} fontSize="medium" />
              </Box>
              <Typography variant="h5" fontWeight="800">
                Create New Notice
              </Typography>
            </Stack>

            <TextField
              fullWidth
              label="Notice Title"
              variant="outlined"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="e.g. Summer Vacation Announcement"
            />

            <TextField
              fullWidth
              label="Notice Details"
              variant="outlined"
              multiline
              rows={4}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              required
              placeholder="Write the full description of the notice here..."
            />

            <TextField
              fullWidth
              label="Notice Date"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loader}
              sx={{ 
                py: 1.5, 
                borderRadius: '12px', 
                fontWeight: 'bold', 
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loader ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Publish Notice'
              )}
            </Button>
            
            <Button 
                fullWidth 
                variant="text" 
                color="inherit" 
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
            >
                Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
      
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  );
};

export default AddNotice;