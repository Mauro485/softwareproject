const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const UserAchievement = require('../models/userAchievement');
const { getAchievementById } = require('../utils/achievementsList');

const router = express.Router();

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Find all unlocked achievements for the user
    const unlocked = await UserAchievement.find({ user: userId }).sort({ unlockedAt: -1 });
    
    // Map them to the full achievement data
    const achievementsData = unlocked.map(record => {
      const achievementDetails = getAchievementById(record.achievementId);
      return {
        ...achievementDetails,
        unlockedAt: record.unlockedAt
      };
    });

    res.status(200).json(achievementsData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user achievements', error: error.message });
  }
});

module.exports = router;
