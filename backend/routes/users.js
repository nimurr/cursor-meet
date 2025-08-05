const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const router = express.Router();

// Create or get user
router.post('/create', async (req, res) => {
  try {
    const { userName, email } = req.body;
    
    let user = await User.findOne({ userName });
    
    if (!user) {
      const userId = uuidv4();
      user = new User({
        userId,
        userName,
        email
      });
      await user.save();
    }

    res.json({
      success: true,
      user: {
        userId: user.userId,
        userName: user.userName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user meeting history
router.post('/:userId/meeting-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roomId, roomName, action } = req.body;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (action === 'join') {
      user.meetingHistory.push({
        roomId,
        roomName,
        joinedAt: new Date()
      });
    } else if (action === 'leave') {
      const meeting = user.meetingHistory.find(m => m.roomId === roomId && !m.leftAt);
      if (meeting) {
        meeting.leftAt = new Date();
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Meeting history updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating meeting history',
      error: error.message
    });
  }
});

module.exports = router;