<<<<<<< HEAD
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Progress = require('../models/Progress');

exports.updateDailyMetrics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });

    const testsAttempted = await TestResult.countDocuments({ 
      createdAt: { $gte: today } 
    });

    const avgScore = await TestResult.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
    ]);

    await Analytics.create({
      date: today,
      metrics: {
        totalUsers,
        activeUsers,
        students,
        admins,
        testsAttempted,
        averageScore: avgScore[0]?.avgScore || 0
      }
    });
  } catch (error) {
    console.error('Daily metrics update error:', error);
  }
};

exports.getStudentAnalytics = async (studentId) => {
  const testResults = await TestResult.find({ student: studentId })
    .populate('test', 'title subject')
    .sort({ createdAt: -1 })
    .limit(10);

  const progress = await Progress.find({ student: studentId })
    .populate('subject', 'name')
    .populate('chapter', 'title');

  const totalTests = testResults.length;
  const avgScore = testResults.reduce((sum, r) => sum + r.percentage, 0) / (totalTests || 1);
  const passedTests = testResults.filter(r => r.percentage >= 50).length;

  const subjectPerformance = {};
  testResults.forEach(result => {
    const subject = result.test.subject.toString();
    if (!subjectPerformance[subject]) {
      subjectPerformance[subject] = { total: 0, sum: 0 };
    }
    subjectPerformance[subject].total++;
    subjectPerformance[subject].sum += result.percentage;
  });

  return {
    totalTests,
    avgScore: avgScore.toFixed(1),
    passedTests,
    passRate: ((passedTests / totalTests) * 100).toFixed(1),
    recentResults: testResults,
    progress,
    subjectPerformance: Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject,
      average: (data.sum / data.total).toFixed(1),
      count: data.total
    }))
  };
};

exports.getSystemAnalytics = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ 
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
  });

  const totalTests = await TestResult.countDocuments();
  const last30Days = await Analytics.find({ 
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
  }).sort({ date: 1 });

  return {
    totalUsers,
    activeUsers,
    totalTests,
    userGrowth: last30Days.map(d => ({
      date: d.date,
      users: d.metrics.totalUsers
    })),
    testActivity: last30Days.map(d => ({
      date: d.date,
      tests: d.metrics.testsAttempted
    }))
  };
=======
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Progress = require('../models/Progress');
const Analytics = require('../models/Analytics');
const Test = require('../models/Test');
const Question = require('../models/Question');

// Calculate user analytics
exports.calculateUserAnalytics = async (userId) => {
  try {
    // Get all test results for the user
    const testResults = await TestResult.find({ student: userId })
      .populate('test', 'subject chapter')
      .sort({ createdAt: -1 });

    if (testResults.length === 0) {
      return {
        metrics: {
          testsCompleted: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
        subjectPerformance: [],
        weakTopics: [],
        strongTopics: []
      };
    }

    // Calculate basic metrics
    const totalTests = testResults.length;
    const totalQuestions = testResults.reduce((sum, result) => sum + result.answers.length, 0);
    const correctAnswers = testResults.reduce((sum, result) =>
      sum + result.answers.filter(a => a.isCorrect).length, 0);
    const averageScore = testResults.reduce((sum, result) => sum + result.percentage, 0) / totalTests;
    const totalTimeSpent = testResults.reduce((sum, result) => sum + result.timeTaken, 0);

    // Calculate subject-wise performance
    const subjectPerformance = await calculateSubjectPerformance(userId);

    // Identify weak and strong topics
    const topicPerformance = await calculateTopicPerformance(userId);
    const weakTopics = topicPerformance.filter(topic => topic.accuracy < 60).slice(0, 5);
    const strongTopics = topicPerformance.filter(topic => topic.accuracy >= 80).slice(0, 5);

    return {
      metrics: {
        testsCompleted: totalTests,
        questionsAnswered: totalQuestions,
        correctAnswers,
        averageScore: Math.round(averageScore),
        totalTimeSpent
      },
      subjectPerformance,
      weakTopics,
      strongTopics
    };

  } catch (error) {
    console.error('Error calculating user analytics:', error);
    throw error;
  }
};

// Calculate subject-wise performance
async function calculateSubjectPerformance(userId) {
  try {
    const subjectStats = await TestResult.aggregate([
      { $match: { student: userId } },
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
          _id: '$testInfo.subject',
          totalTests: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          lastTestDate: { $max: '$createdAt' }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    return subjectStats.map(stat => ({
      subject: stat._id,
      totalTests: stat.totalTests,
      averageScore: Math.round(stat.averageScore),
      bestScore: Math.round(stat.bestScore),
      lastTestDate: stat.lastTestDate
    }));

  } catch (error) {
    console.error('Error calculating subject performance:', error);
    return [];
  }
}

// Calculate topic-wise performance
async function calculateTopicPerformance(userId) {
  try {
    const topicStats = await TestResult.aggregate([
      { $match: { student: userId } },
      { $unwind: '$answers' },
      {
        $lookup: {
          from: 'questions',
          localField: 'answers.question',
          foreignField: '_id',
          as: 'questionInfo'
        }
      },
      { $unwind: '$questionInfo' },
      {
        $group: {
          _id: '$questionInfo.topic',
          totalQuestions: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: ['$answers.isCorrect', 1, 0] }
          }
        }
      },
      {
        $addFields: {
          accuracy: {
            $multiply: [
              { $divide: ['$correctAnswers', '$totalQuestions'] },
              100
            ]
          }
        }
      },
      { $sort: { accuracy: -1 } }
    ]);

    return topicStats.map(stat => ({
      topic: stat._id,
      totalQuestions: stat.totalQuestions,
      correctAnswers: stat.correctAnswers,
      accuracy: Math.round(stat.accuracy)
    }));

  } catch (error) {
    console.error('Error calculating topic performance:', error);
    return [];
  }
}

// Calculate system-wide analytics
exports.calculateSystemAnalytics = async (period = '30d') => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    startDate.setDate(endDate.getDate() - days);

    // User statistics
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    // Test statistics
    const [totalTests, testAttempts] = await Promise.all([
      Test.countDocuments({ isActive: true }),
      TestResult.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    // Performance metrics
    const testResults = await TestResult.find({ createdAt: { $gte: startDate } });
    const averageScore = testResults.length > 0
      ? testResults.reduce((sum, result) => sum + result.percentage, 0) / testResults.length
      : 0;

    const passRate = testResults.length > 0
      ? (testResults.filter(result => result.status === 'passed').length / testResults.length) * 100
      : 0;

    // Content engagement
    const [totalQuestions, totalViews] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$stats.views' } } }
      ])
    ]);

    return {
      period,
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers
      },
      tests: {
        total: totalTests,
        attempts: testAttempts,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate)
      },
      content: {
        questions: totalQuestions,
        totalViews: totalViews[0]?.total || 0
      }
    };

  } catch (error) {
    console.error('Error calculating system analytics:', error);
    throw error;
  }
};

// Generate study recommendations
exports.generateStudyRecommendations = async (userId) => {
  try {
    const analytics = await calculateUserAnalytics(userId);

    const recommendations = [];

    // Based on weak topics
    if (analytics.weakTopics.length > 0) {
      recommendations.push({
        type: 'weak_topics',
        title: 'Focus on Weak Areas',
        description: `Improve your performance in ${analytics.weakTopics.slice(0, 3).map(t => t.topic).join(', ')}`,
        priority: 'high',
        topics: analytics.weakTopics.slice(0, 3)
      });
    }

    // Based on subject performance
    const lowPerformingSubjects = analytics.subjectPerformance.filter(s => s.averageScore < 70);
    if (lowPerformingSubjects.length > 0) {
      recommendations.push({
        type: 'subject_focus',
        title: 'Subject Improvement Needed',
        description: `Dedicate more time to ${lowPerformingSubjects[0].subject}`,
        priority: 'high',
        subject: lowPerformingSubjects[0]
      });
    }

    // Based on test frequency
    const recentTests = await TestResult.find({ student: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const daysSinceLastTest = recentTests.length > 0
      ? Math.floor((new Date() - recentTests[0].createdAt) / (1000 * 60 * 60 * 24))
      : 30;

    if (daysSinceLastTest > 7) {
      recommendations.push({
        type: 'practice_frequency',
        title: 'Increase Practice Frequency',
        description: 'Regular practice improves retention. Take at least one test per week.',
        priority: 'medium',
        daysSinceLastTest
      });
    }

    // Based on time management
    const avgTimePerTest = analytics.metrics.totalTimeSpent / analytics.metrics.testsCompleted;
    if (avgTimePerTest > 3600) { // More than 1 hour per test
      recommendations.push({
        type: 'time_management',
        title: 'Improve Time Management',
        description: 'Work on completing tests more efficiently while maintaining accuracy.',
        priority: 'medium',
        averageTime: Math.round(avgTimePerTest / 60)
      });
    }

    return recommendations;

  } catch (error) {
    console.error('Error generating study recommendations:', error);
    return [];
  }
};

// Calculate progress trends
exports.calculateProgressTrends = async (userId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      student: userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const trends = {
      scores: analytics.map(a => ({
        date: a.date,
        score: a.metrics.averageScore || 0
      })),
      testsCompleted: analytics.map(a => ({
        date: a.date,
        count: a.metrics.testsCompleted || 0
      })),
      timeSpent: analytics.map(a => ({
        date: a.date,
        minutes: Math.round((a.metrics.totalTimeSpent || 0) / 60)
      }))
    };

    return trends;

  } catch (error) {
    console.error('Error calculating progress trends:', error);
    return { scores: [], testsCompleted: [], timeSpent: [] };
  }
};

// Calculate leaderboard
exports.calculateLeaderboard = async (options = {}) => {
  try {
    const { subject, grade, limit = 10, period = 'all' } = options;

    let matchConditions = { 'student.status': 'active' };

    if (grade) matchConditions['student.grade'] = grade;

    // Add date filter for period
    if (period !== 'all') {
      const startDate = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
      startDate.setDate(startDate.getDate() - days);
      matchConditions.date = { $gte: startDate };
    }

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $match: matchConditions },
      {
        $group: {
          _id: '$student._id',
          firstName: { $first: '$student.firstName' },
          lastName: { $first: '$student.lastName' },
          grade: { $first: '$student.grade' },
          totalTests: { $sum: '$metrics.testsCompleted' },
          averageScore: { $avg: '$metrics.averageScore' },
          totalTimeSpent: { $sum: '$metrics.totalTimeSpent' }
        }
      },
      {
        $match: {
          totalTests: { $gt: 0 }
        }
      },
      { $sort: { averageScore: -1, totalTests: -1 } },
      { $limit: limit }
    ];

    // Add subject filter if specified
    if (subject) {
      pipeline.splice(2, 0, {
        $lookup: {
          from: 'testresults',
          localField: 'student._id',
          foreignField: 'student',
          as: 'testResults'
        }
      });
      pipeline.splice(3, 0, { $unwind: '$testResults' });
      pipeline.splice(4, 0, {
        $lookup: {
          from: 'tests',
          localField: 'testResults.test',
          foreignField: '_id',
          as: 'testInfo'
        }
      });
      pipeline.splice(5, 0, { $unwind: '$testInfo' });
      pipeline.splice(6, 0, { $match: { 'testInfo.subject': subject } });
    }

    const leaderboard = await Analytics.aggregate(pipeline);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      studentId: entry._id,
      firstName: entry.firstName,
      lastName: entry.lastName,
      grade: entry.grade,
      totalTests: entry.totalTests,
      averageScore: Math.round(entry.averageScore),
      totalTimeSpent: Math.round(entry.totalTimeSpent / 60) // Convert to minutes
    }));

  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    return [];
  }
};

// Calculate content effectiveness
exports.calculateContentEffectiveness = async () => {
  try {
    // Most attempted questions
    const questionStats = await TestResult.aggregate([
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.question',
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: { $cond: ['$answers.isCorrect', 1, 0] }
          }
        }
      },
      {
        $addFields: {
          accuracy: {
            $multiply: [
              { $divide: ['$correctAttempts', '$totalAttempts'] },
              100
            ]
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 20 }
    ]);

    // Most taken tests
    const testStats = await TestResult.aggregate([
      {
        $group: {
          _id: '$test',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 20 }
    ]);

    return {
      questions: await Promise.all(questionStats.map(async (stat) => {
        const question = await Question.findById(stat._id, 'question topic subject');
        return {
          questionId: stat._id,
          question: question?.question || 'Unknown',
          topic: question?.topic || 'Unknown',
          subject: question?.subject || 'Unknown',
          totalAttempts: stat.totalAttempts,
          accuracy: Math.round(stat.accuracy)
        };
      })),
      tests: await Promise.all(testStats.map(async (stat) => {
        const test = await Test.findById(stat._id, 'title subject');
        return {
          testId: stat._id,
          title: test?.title || 'Unknown',
          subject: test?.subject || 'Unknown',
          totalAttempts: stat.totalAttempts,
          averageScore: Math.round(stat.averageScore)
        };
      }))
    };

  } catch (error) {
    console.error('Error calculating content effectiveness:', error);
    return { questions: [], tests: [] };
  }
>>>>>>> 4bef707 (Add complete owner dashboard pages with full functionality)
};
