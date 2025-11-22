const Analytics = require('../models/Analytics');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Progress = require('../models/Progress');
const { ANALYTICS_PERIODS } = require('../utils/constants');

// Get student analytics
exports.getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;

    // Check permissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get test results
    const testResults = await TestResult.find({ student: studentId })
      .populate('test', 'title subject chapter')
      .sort({ createdAt: -1 });

    // Calculate test statistics
    const testStats = {
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.status === 'passed').length,
      failedTests: testResults.filter(r => r.status === 'failed').length,
      averageScore: testResults.length > 0
        ? testResults.reduce((sum, r) => sum + r.percentage, 0) / testResults.length
        : 0,
      totalTimeSpent: testResults.reduce((sum, r) => sum + r.timeTaken, 0)
    };

    // Get progress statistics
    const progressStats = await Progress.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Get subject-wise performance
    const subjectPerformance = await TestResult.aggregate([
      { $match: { student: student._id } },
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      { $unwind: '$testInfo' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'testInfo.subject',
          foreignField: '_id',
          as: 'subjectInfo'
        }
      },
      { $unwind: '$subjectInfo' },
      {
        $group: {
          _id: '$subjectInfo.name',
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          lastTestDate: { $max: '$createdAt' }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Get recent activity
    const recentActivity = await Promise.all([
      TestResult.find({ student: studentId })
        .populate('test', 'title')
        .sort({ createdAt: -1 })
        .limit(5),
      Progress.find({ student: studentId })
        .populate('resourceId', 'title name')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const recentTests = recentActivity[0].map(result => ({
      type: 'test',
      title: result.test.title,
      score: result.percentage,
      status: result.status,
      date: result.createdAt
    }));

    const recentProgress = recentActivity[1].map(progress => ({
      type: progress.type,
      title: progress.resourceId?.title || progress.resourceId?.name || 'Unknown',
      progress: progress.progress,
      status: progress.status,
      date: progress.updatedAt
    }));

    const recentActivityCombined = [...recentTests, ...recentProgress]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Get study streak
    const studyStreak = await calculateStudyStreak(studentId);

    // Get learning goals progress
    const learningGoals = await calculateLearningGoals(studentId);

    res.json({
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade
      },
      testStats,
      progressStats,
      subjectPerformance,
      recentActivity: recentActivityCombined,
      studyStreak,
      learningGoals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system analytics (admin/owner only)
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { period = ANALYTICS_PERIODS.MONTH } = req.query;

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // Test statistics
    const testStats = await TestResult.aggregate([
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          passRate: {
            $avg: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Content statistics
    const contentStats = await Promise.all([
      require('../models/Subject').countDocuments({ isActive: true }),
      require('../models/Chapter').countDocuments({ isActive: true }),
      require('../models/Test').countDocuments({ isActive: true }),
      require('../models/Note').countDocuments({ isActive: true }),
      require('../models/Animation').countDocuments({ isActive: true }),
      require('../models/Book').countDocuments({ isActive: true })
    ]);

    // Activity trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activityTrends = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      TestResult.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      require('../models/Note').countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Grade distribution
    const gradeDistribution = await User.aggregate([
      { $match: { role: 'student', status: 'active' } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Subject popularity
    const subjectPopularity = await TestResult.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      { $unwind: '$testInfo' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'testInfo.subject',
          foreignField: '_id',
          as: 'subjectInfo'
        }
      },
      { $unwind: '$subjectInfo' },
      {
        $group: {
          _id: '$subjectInfo.name',
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      },
      { $sort: { testsTaken: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      userStats,
      testStats: testStats[0] || {},
      contentStats: {
        subjects: contentStats[0],
        chapters: contentStats[1],
        tests: contentStats[2],
        notes: contentStats[3],
        animations: contentStats[4],
        books: contentStats[5]
      },
      activityTrends: {
        newUsers: activityTrends[0],
        testsCompleted: activityTrends[1],
        notesCreated: activityTrends[2]
      },
      gradeDistribution,
      subjectPopularity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subject analytics
exports.getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Test performance for this subject
    const testPerformance = await TestResult.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      { $unwind: '$testInfo' },
      { $match: { 'testInfo.subject': require('mongoose').Types.ObjectId(subjectId) } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          passRate: {
            $avg: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Chapter-wise performance
    const chapterPerformance = await TestResult.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      { $unwind: '$testInfo' },
      { $match: { 'testInfo.subject': require('mongoose').Types.ObjectId(subjectId) } },
      {
        $lookup: {
          from: 'chapters',
          localField: 'testInfo.chapter',
          foreignField: '_id',
          as: 'chapterInfo'
        }
      },
      { $unwind: { path: '$chapterInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$chapterInfo.name',
          testsTaken: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      },
      { $sort: { testsTaken: -1 } }
    ]);

    // Student engagement
    const studentEngagement = await Progress.aggregate([
      { $match: { subject: require('mongoose').Types.ObjectId(subjectId) } },
      {
        $group: {
          _id: '$type',
          totalProgress: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      testPerformance: testPerformance[0] || {},
      chapterPerformance,
      studentEngagement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user engagement analytics
exports.getUserEngagement = async (req, res) => {
  try {
    const { period = ANALYTICS_PERIODS.WEEK } = req.query;

    const periodDays = getPeriodDays(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Daily active users
    const dailyActiveUsers = await User.aggregate([
      { $match: { lastLoginAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastLoginAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Content engagement
    const contentEngagement = await Promise.all([
      TestResult.countDocuments({ createdAt: { $gte: startDate } }),
      require('../models/Note').countDocuments({ createdAt: { $gte: startDate } }),
      require('../models/Animation').aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    // User retention (simplified)
    const userRetention = await calculateUserRetention(startDate);

    res.json({
      period,
      dailyActiveUsers,
      contentEngagement: {
        testsCompleted: contentEngagement[0],
        notesCreated: contentEngagement[1],
        animationViews: contentEngagement[2][0]?.totalViews || 0
      },
      userRetention
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update student analytics
exports.updateStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Recalculate and update analytics for student
    const analytics = await calculateStudentAnalytics(studentId);

    await Analytics.findOneAndUpdate(
      { student: studentId },
      {
        ...analytics,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Student analytics updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get performance trends
exports.getPerformanceTrends = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = ANALYTICS_PERIODS.MONTH } = req.query;

    const periodDays = getPeriodDays(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get test results over time
    const performanceTrends = await TestResult.aggregate([
      { $match: { student: require('mongoose').Types.ObjectId(studentId), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          averageScore: { $avg: '$percentage' },
          testsTaken: { $sum: 1 },
          timeSpent: { $sum: '$timeTaken' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Progress trends
    const progressTrends = await Progress.aggregate([
      { $match: { student: require('mongoose').Types.ObjectId(studentId), updatedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          itemsCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      performanceTrends,
      progressTrends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { subject, grade, limit = 10 } = req.query;

    let matchConditions = {};

    if (subject) {
      // Get tests for this subject
      const subjectTests = await require('../models/Test').find({ subject }).select('_id');
      const testIds = subjectTests.map(t => t._id);
      matchConditions.test = { $in: testIds };
    }

    if (grade) {
      // Get students of this grade
      const gradeStudents = await User.find({ grade, role: 'student' }).select('_id');
      const studentIds = gradeStudents.map(s => s._id);
      matchConditions.student = { $in: studentIds };
    }

    const leaderboard = await TestResult.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$student',
          name: { $first: { $concat: ['$studentInfo.firstName', ' ', '$studentInfo.lastName'] } },
          grade: { $first: '$studentInfo.grade' },
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          highestScore: { $max: '$percentage' },
          totalTimeSpent: { $sum: '$timeTaken' }
        }
      },
      { $sort: { averageScore: -1, totalTests: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get content analytics
exports.getContentAnalytics = async (req, res) => {
  try {
    // Most popular tests
    const popularTests = await TestResult.aggregate([
      {
        $lookup: {
          from: 'tests',
          localField: 'test',
          foreignField: '_id',
          as: 'testInfo'
        }
      },
      { $unwind: '$testInfo' },
      {
        $group: {
          _id: '$testInfo.title',
          attempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 }
    ]);

    // Most viewed content
    const viewedContent = await Promise.all([
      require('../models/Animation').find({ isActive: true }).select('title views').sort({ views: -1 }).limit(5),
      require('../models/Note').find({ isActive: true }).select('title views').sort({ views: -1 }).limit(5)
    ]);

    res.json({
      popularTests,
      viewedContent: {
        animations: viewedContent[0],
        notes: viewedContent[1]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    // Database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // System uptime (simplified)
    const uptime = process.uptime();

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // Recent errors (simplified - would need error logging system)
    const recentErrors = 0; // Placeholder

    // Active users (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastLoginAt: { $gte: oneDayAgo } });

    res.json({
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      system: {
        uptime: Math.floor(uptime),
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
        }
      },
      metrics: {
        activeUsers,
        recentErrors
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export analytics
exports.exportAnalytics = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    let data;

    switch (type) {
      case 'students':
        data = await getStudentAnalyticsExport();
        break;
      case 'tests':
        data = await getTestAnalyticsExport();
        break;
      case 'system':
        data = await getSystemAnalyticsExport();
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Convert to CSV (simplified)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
async function calculateStudyStreak(studentId) {
  // Simplified streak calculation
  const recentActivity = await Progress.find({
    student: studentId,
    updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }).sort({ updatedAt: -1 });

  // Group by date
  const activityDates = [...new Set(recentActivity.map(a =>
    a.updatedAt.toISOString().split('T')[0]
  ))].sort();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = today;

  for (let i = 0; i < 30; i++) {
    if (activityDates.includes(currentDate)) {
      streak++;
      // Move to previous day
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = date.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return { current: streak, longest: streak }; // Simplified
}

async function calculateLearningGoals(studentId) {
  // Simplified learning goals
  const progress = await Progress.find({ student: studentId });

  const goals = [
    { name: 'Complete 5 tests', current: progress.filter(p => p.type === 'test').length, target: 5 },
    { name: 'Read 10 chapters', current: progress.filter(p => p.type === 'chapter').length, target: 10 },
    { name: 'Watch 5 animations', current: progress.filter(p => p.type === 'animation').length, target: 5 }
  ];

  return goals.map(goal => ({
    ...goal,
    progress: Math.min((goal.current / goal.target) * 100, 100),
    completed: goal.current >= goal.target
  }));
}

function getPeriodDays(period) {
  const days = {
    [ANALYTICS_PERIODS.DAY]: 1,
    [ANALYTICS_PERIODS.WEEK]: 7,
    [ANALYTICS_PERIODS.MONTH]: 30,
    [ANALYTICS_PERIODS.QUARTER]: 90,
    [ANALYTICS_PERIODS.YEAR]: 365,
    [ANALYTICS_PERIODS.ALL]: 365 * 10 // 10 years
  };
  return days[period] || 30;
}

async function calculateUserRetention(startDate) {
  // Simplified retention calculation
  const users = await User.find({ createdAt: { $gte: startDate } });
  const activeUsers = await User.find({
    createdAt: { $gte: startDate },
    lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return {
    total: users.length,
    retained: activeUsers.length,
    retentionRate: users.length > 0 ? (activeUsers.length / users.length) * 100 : 0
  };
}

async function calculateStudentAnalytics(studentId) {
  // Comprehensive analytics calculation
  const [testResults, progress] = await Promise.all([
    TestResult.find({ student: studentId }),
    Progress.find({ student: studentId })
  ]);

  return {
    totalTests: testResults.length,
    averageScore: testResults.reduce((sum, r) => sum + r.percentage, 0) / testResults.length || 0,
    totalProgress: progress.length,
    completedItems: progress.filter(p => p.status === 'completed').length
  };
}

function convertToCSV(data) {
  // Simplified CSV conversion
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Placeholder export functions
async function getStudentAnalyticsExport() {
  return await User.find({ role: 'student' }).select('firstName lastName email grade createdAt');
}

async function getTestAnalyticsExport() {
  return await TestResult.find().populate('test', 'title').populate('student', 'firstName lastName');
}

async function getSystemAnalyticsExport() {
  const [userCount, testCount, noteCount] = await Promise.all([
    User.countDocuments(),
    require('../models/Test').countDocuments(),
    require('../models/Note').countDocuments()
  ]);

  return [{ users: userCount, tests: testCount, notes: noteCount }];
}
