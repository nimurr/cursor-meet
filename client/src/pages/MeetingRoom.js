import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

function MeetingRoom() {
  const { roomId } = useParams();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
      <Typography variant="h4">Meeting Room</Typography>
      <Typography variant="subtitle1">Room ID: {roomId}</Typography>
      {/* Video and chat UI will go here */}
    </Box>
  );
}

export default MeetingRoom;