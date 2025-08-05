import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}`);
  };

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
      <Typography variant="h4" gutterBottom>Video Meet</Typography>
      <Button variant="contained" color="primary" onClick={handleCreate} sx={{ mb: 2 }}>
        Create New Meeting
      </Button>
      <TextField
        label="Enter Room ID"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="outlined" color="secondary" onClick={handleJoin}>
        Join Meeting
      </Button>
    </Box>
  );
}

export default Home;