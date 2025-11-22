const Profile = require('../models/Profile');
const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'firstName lastName email role grade');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { bio, avatar, preferences, socialLinks } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    if (bio !== undefined) profile.bio = bio;
    if (avatar !== undefined) profile.avatar = avatar;
    if (preferences !== undefined) profile.preferences = { ...profile.preferences, ...preferences };
    if (socialLinks !== undefined) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

    profile.updatedAt = new Date();
    await profile.save();

    // Update user basic info if provided
    const userUpdates = {};
    if (req.body.firstName) userUpdates.firstName = req.body.firstName;
    if (req.body.lastName) userUpdates.lastName = req.body.lastName;
    if (req.body.grade) userUpdates.grade = req.body.grade;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates);
    }

    const updatedProfile = await Profile.findOne({ user: req.user.id }).populate('user', 'firstName lastName email role grade');
    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user stats
const getStats = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, data: profile.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user stats
const updateStats = async (req, res) => {
  try {
    const { totalStudyTime, testsCompleted, averageScore, currentStreak, longestStreak, favoriteSubject } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (totalStudyTime !== undefined) profile.stats.totalStudyTime = totalStudyTime;
    if (testsCompleted !== undefined) profile.stats.testsCompleted = testsCompleted;
    if (averageScore !== undefined) profile.stats.averageScore = averageScore;
    if (currentStreak !== undefined) profile.stats.currentStreak = currentStreak;
    if (longestStreak !== undefined) profile.stats.longestStreak = longestStreak;
    if (favoriteSubject !== undefined) profile.stats.favoriteSubject = favoriteSubject;

    profile.updatedAt = new Date();
    await profile.save();

    res.json({ success: true, data: profile.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add achievement
const addAchievement = async (req, res) => {
  try {
    const { title, description, icon } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.achievements.push({
      title,
      description,
      icon,
      earnedAt: new Date()
    });

    await profile.save();
    res.json({ success: true, data: profile.achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  updateStats,
  addAchievement
};
