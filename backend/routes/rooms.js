const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');

const router = express.Router();

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { roomName, createdBy } = req.body;
    const roomId = uuidv4();

    const room = new Room({
      roomId,
      roomName,
      createdBy
    });

    await room.save();

    res.json({
      success: true,
      roomId,
      roomName,
      message: 'Room created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
});

// Join an existing room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOne({ roomId, isActive: true });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or inactive'
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        createdBy: room.createdBy,
        participantCount: room.participants.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room details',
      error: error.message
    });
  }
});

// End a room
router.post('/:roomId/end', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOneAndUpdate(
      { roomId },
      { 
        isActive: false,
        endedAt: new Date()
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending room',
      error: error.message
    });
  }
});

module.exports = router;