const User = require('../models/User');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Analytics = require('../models/Analytics');
const TestResult = require('../models/TestResult');
const Book = require('../models/Book');
const Note = require('../models/Note');
const Animation = require('../models/Animation');
const PastPaper = require('../models/PastPaper');
const Notification = require('../models/Notification');

// Get admin dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const [userStats, testStats, questionStats, recentActivity, systemHealth] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Test.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, published: { $sum: { $cond: ['$isPublished', 1, 0] } } } }
      ]),
      Question.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, bySubject: { $push: '$subject' } } }
      ]),
      // Recent activity - get recent test results and user registrations
      TestResult.find()
        .populate('student test')
        .sort({ createdAt: -1 })
        .limit(10),
      // System health - mock data
      Promise.resolve({
        serverStatus: 'healthy',
        databaseStatus: 'connected',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      })
    ]);

    // Calculate additional metrics
    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
    const activeStudents = userStats.find(s => s._id === 'student')?.count || 0;
    const totalTests = testStats[0]?.total || 0;
    const publishedTests = testStats[0]?.published || 0;
    const totalQuestions = questionStats[0]?.total || 0;

    // Mock engagement data
    const engagementData = {
      dailyActiveUsers: Math.floor(totalUsers * 0.7),
      weeklyActiveUsers: Math.floor(totalUsers * 0.85),
      monthlyActiveUsers: totalUsers,
      averageSessionDuration: 45, // minutes
      testCompletionRate: 78, // percentage
      popularSubjects: ['Biology', 'Chemistry', 'Physics']
    };

    // Mock revenue data
    const revenueData = {
      totalRevenue: 12500,
      monthlyRevenue: 2100,
      subscriptions: {
        basic: 45,
        premium: 23,
        enterprise: 5
      },
      growth: 12.5 // percentage
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeStudents,
          totalTests,
          publishedTests,
          totalQuestions,
          systemHealth
        },
        engagement: engagementData,
        revenue: revenueData,
        recentActivity: recentActivity.map(activity => ({
          type: 'test_completed',
          description: `${activity.student.firstName} ${activity.student.lastName} completed ${activity.test.title}`,
          timestamp: activity.createdAt,
          score: activity.percentage
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tests for admin
exports.getTests = async (req, res) => {
  try {
    const { subject, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (status) filter.status = status;

    const tests = await Test.find(filter)
      .populate('subject chapter createdBy')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Test.countDocuments(filter);

    res.json({
      success: true,
      data: tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all questions for admin
exports.getQuestions = async (req, res) => {
  try {
    const { subject, chapter, difficulty, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .populate('subject chapter')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create test
exports.createTest = async (req, res) => {
  try {
    const { title, description, subject, chapter, grade, questions, duration, totalMarks, passingMarks, instructions } = req.body;

    const test = await Test.create({
      title,
      description,
      subject,
      chapter,
      grade,
      questions,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      createdBy: req.user._id,
      isActive: true,
      isPublished: false
    });

    await test.populate('subject chapter createdBy');

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update test
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const test = await Test.findByIdAndUpdate(id, updates, { new: true })
      .populate('subject chapter createdBy');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete test
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findByIdAndDelete(id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create question
exports.createQuestion = async (req, res) => {
  try {
    const questionData = req.body;

    const question = await Question.create({
      ...questionData,
      createdBy: req.user._id,
      isActive: true
    });

    await question.populate('subject chapter');

    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findByIdAndUpdate(id, updates, { new: true })
      .populate('subject chapter');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get system analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Mock analytics data - in real app would calculate from database
    const analytics = {
      userGrowth: {
        total: 150,
        growth: 12.5,
        newUsers: 23
      },
      engagement: {
        dailyActive: 89,
        weeklyActive: 127,
        monthlyActive: 150,
        avgSessionTime: 45
      },
      content: {
        totalTests: 25,
        totalQuestions: 500,
        avgTestScore: 78.5,
        completionRate: 82.3
      },
      performance: {
        serverUptime: 99.9,
        avgResponseTime: 245,
        errorRate: 0.1
      }
    };

    res.json({
      success: true,
      data: analytics,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user engagement data
exports.getUserEngagement = async (req, res) => {
  try {
    const engagement = {
      daily: [
        { date: '2024-01-15', activeUsers: 45, sessions: 67, avgDuration: 32 },
        { date: '2024-01-16', activeUsers: 52, sessions: 78, avgDuration: 38 },
        { date: '2024-01-17', activeUsers: 48, sessions: 72, avgDuration: 35 }
      ],
      weekly: [
        { week: 'Week 1', activeUsers: 120, newUsers: 15, retention: 85 },
        { week: 'Week 2', activeUsers: 135, newUsers: 18, retention: 87 },
        { week: 'Week 3', activeUsers: 142, newUsers: 22, retention: 89 }
      ],
      subjectPopularity: [
        { subject: 'Biology', users: 89, percentage: 59.3 },
        { subject: 'Chemistry', users: 45, percentage: 30.0 },
        { subject: 'Physics', users: 16, percentage: 10.7 }
      ]
    };

    res.json({
      success: true,
      data: engagement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get content analytics
exports.getContentAnalytics = async (req, res) => {
  try {
    const content = {
      tests: {
        total: 25,
        published: 22,
        draft: 3,
        avgQuestions: 20,
        avgDuration: 35
      },
      questions: {
        total: 500,
        byDifficulty: {
          easy: 150,
          medium: 250,
          hard: 100
        },
        bySubject: {
          biology: 300,
          chemistry: 150,
          physics: 50
        }
      },
      performance: {
        avgScore: 78.5,
        passRate: 82.3,
        topPerformingSubject: 'Biology',
        mostAttemptedTest: 'Cell Biology Fundamentals'
      }
    };

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, grade } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
      grade,
      isActive: true
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SUBJECT MANAGEMENT ====================

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const { grade, page = 1, limit = 50 } = req.query;

    const filter = { isActive: true };
    if (grade) filter.grade = grade;

    const subjects = await Subject.find(filter)
      .populate('chapters')
      .sort({ order: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(filter);

    res.json({
      success: true,
      data: subjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create subject
exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, grade, icon, color } = req.body;

    const subject = await Subject.create({
      name,
      code,
      description,
      grade,
      icon,
      color,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updates = req.body;

    const subject = await Subject.findByIdAndUpdate(subjectId, updates, { new: true });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByIdAndDelete(subjectId);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== NOTE MANAGEMENT ====================

// Get all notes
exports.getNotes = async (req, res) => {
  try {
    const { subject, chapter, grade, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (grade) filter.grade = grade;

    const notes = await Note.find(filter)
      .populate('subject chapter createdBy', 'name title firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(filter);

    res.json({
      success: true,
      data: notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create note
exports.createNote = async (req, res) => {
  try {
    const { title, content, summary, subject, chapter, grade, tags, difficulty } = req.body;

    const note = await Note.create({
      title,
      content,
      summary,
      subject,
      chapter,
      grade,
      tags,
      difficulty,
      createdBy: req.user._id
    });

    await note.populate('subject chapter', 'name title');

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updates = req.body;

    const note = await Note.findByIdAndUpdate(noteId, updates, { new: true })
      .populate('subject chapter', 'name title');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== BOOK MANAGEMENT ====================

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const { subject, grade, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const books = await Book.find(filter)
      .populate('subject chapters createdBy', 'name title firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create book
exports.createBook = async (req, res) => {
  try {
    const bookData = req.body;

    const book = await Book.create({
      ...bookData,
      createdBy: req.user._id
    });

    await book.populate('subject chapters', 'name title');

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const updates = req.body;

    const book = await Book.findByIdAndUpdate(bookId, updates, { new: true })
      .populate('subject chapters', 'name title');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== CHAPTER MANAGEMENT ====================

// Get all chapters
exports.getChapters = async (req, res) => {
  try {
    const { subject, grade, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const chapters = await Chapter.find(filter)
      .populate('subject prerequisites', 'name title')
      .sort({ chapterNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chapter.countDocuments(filter);

    res.json({
      success: true,
      data: chapters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create chapter
exports.createChapter = async (req, res) => {
  try {
    const chapterData = req.body;

    const chapter = await Chapter.create({
      ...chapterData,
      createdBy: req.user._id
    });

    await chapter.populate('subject prerequisites', 'name title');

    // Update subject with chapter reference
    if (chapterData.subject) {
      await Subject.findByIdAndUpdate(
        chapterData.subject,
        { $push: { chapters: chapter._id } }
      );
    }

    res.status(201).json({
      success: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update chapter
exports.updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const updates = req.body;

    const chapter = await Chapter.findByIdAndUpdate(chapterId, updates, { new: true })
      .populate('subject prerequisites', 'name title');

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json({
      success: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete chapter
exports.deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findByIdAndDelete(chapterId);

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Remove chapter reference from subject
    await Subject.findByIdAndUpdate(
      chapter.subject,
      { $pull: { chapters: chapter._id } }
    );

    res.json({
      success: true,
      message: 'Chapter deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ANIMATION MANAGEMENT ====================

// Get all animations
exports.getAnimations = async (req, res) => {
  try {
    const { subject, chapter, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;

    const animations = await Animation.find(filter)
      .populate('subject chapter createdBy', 'name title firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Animation.countDocuments(filter);

    res.json({
      success: true,
      data: animations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create animation
exports.createAnimation = async (req, res) => {
  try {
    const animationData = req.body;

    const animation = await Animation.create({
      ...animationData,
      createdBy: req.user._id
    });

    await animation.populate('subject chapter', 'name title');

    res.status(201).json({
      success: true,
      data: animation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update animation
exports.updateAnimation = async (req, res) => {
  try {
    const { animationId } = req.params;
    const updates = req.body;

    const animation = await Animation.findByIdAndUpdate(animationId, updates, { new: true })
      .populate('subject chapter', 'name title');

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    res.json({
      success: true,
      data: animation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete animation
exports.deleteAnimation = async (req, res) => {
  try {
    const { animationId } = req.params;

    const animation = await Animation.findByIdAndDelete(animationId);

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    res.json({
      success: true,
      message: 'Animation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== PAST PAPER MANAGEMENT ====================

// Get all past papers
exports.getPastPapers = async (req, res) => {
  try {
    const { subject, year, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (year) filter.year = parseInt(year);

    const pastPapers = await PastPaper.find(filter)
      .populate('subject createdBy', 'name firstName lastName')
      .sort({ year: -1, session: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PastPaper.countDocuments(filter);

    res.json({
      success: true,
      data: pastPapers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create past paper
exports.createPastPaper = async (req, res) => {
  try {
    const pastPaperData = req.body;

    const pastPaper = await PastPaper.create({
      ...pastPaperData,
      createdBy: req.user._id
    });

    await pastPaper.populate('subject', 'name');

    res.status(201).json({
      success: true,
      data: pastPaper
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update past paper
exports.updatePastPaper = async (req, res) => {
  try {
    const { pastPaperId } = req.params;
    const updates = req.body;

    const pastPaper = await PastPaper.findByIdAndUpdate(pastPaperId, updates, { new: true })
      .populate('subject', 'name');

    if (!pastPaper) {
      return res.status(404).json({ error: 'Past paper not found' });
    }

    res.json({
      success: true,
      data: pastPaper
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete past paper
exports.deletePastPaper = async (req, res) => {
  try {
    const { pastPaperId } = req.params;

    const pastPaper = await PastPaper.findByIdAndDelete(pastPaperId);

    if (!pastPaper) {
      return res.status(404).json({ error: 'Past paper not found' });
    }

    res.json({
      success: true,
      message: 'Past paper deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const notificationData = req.body;

    const notification = await Notification.create({
      ...notificationData,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notification
exports.updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updates = req.body;

    const notification = await Notification.findByIdAndUpdate(notificationId, updates, { new: true });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ANALYTICS ====================

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Get real data from database
    const [totalUsers, totalTests, totalNotes, totalBooks, totalPastPapers, recentTests] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Test.countDocuments({ isPublished: true }),
      Note.countDocuments({ isActive: true }),
      Book.countDocuments({ isActive: true }),
      PastPaper.countDocuments({ isActive: true }),
      TestResult.find()
        .populate('student test')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalTests,
        totalNotes,
        totalBooks,
        totalPastPapers,
        activeUsers: Math.floor(totalUsers * 0.7)
      },
      recentActivity: recentTests.map(result => ({
        type: 'test_completed',
        description: `${result.student?.firstName} ${result.student?.lastName} completed ${result.test?.title}`,
        timestamp: result.createdAt,
        score: result.percentage
      }))
    };

    res.json({
      success: true,
      data: analytics,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
