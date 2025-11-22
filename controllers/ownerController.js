const User = require('../models/User');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Analytics = require('../models/Analytics');
const mongoose = require('mongoose');

// Get system analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalTests,
      totalQuestions,
      recentActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Test.countDocuments({ isPublished: true }),
      Question.countDocuments({ status: 'active' }),
      TestResult.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('student test')
    ]);

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get test performance by subject
    const subjectPerformance = await TestResult.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testData'
        }
      },
      { $unwind: '$testData' },
      {
        $group: {
          _id: '$testData.subject',
          averageScore: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalTests,
        totalQuestions
      },
      userGrowth,
      subjectPerformance,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get revenue analytics (placeholder for future payment integration)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    // Placeholder for future payment integration
    res.json({
      totalRevenue: 0,
      monthlyRevenue: [],
      subscriptions: {
        active: 0,
        expired: 0,
        trial: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user management data
exports.getUserManagement = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
    
    const [questionCount, testCount, userCount] = await Promise.all([
      Question.countDocuments(),
      Test.countDocuments(),
      User.countDocuments()
    ]);

    res.json({
      status: 'healthy',
      database: {
        status: dbStatus,
        collections: {
          questions: questionCount,
          tests: testCount,
          users: userCount
        }
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
};

// Get content management data
exports.getContentManagement = async (req, res) => {
  try {
    const [subjects, tests, questions] = await Promise.all([
      Subject.find().sort({ grade: 1, order: 1 }),
      Test.find().populate('subject').sort({ createdAt: -1 }).limit(20),
      Question.aggregate([
        {
          $group: {
            _id: { subject: '$subject', difficulty: '$difficulty' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      subjects,
      tests,
      questionStats: questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user (owner only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'owner') {
      return res.status(403).json({ error: 'Cannot delete owner account' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
