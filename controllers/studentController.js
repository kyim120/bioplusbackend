const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Book = require('../models/Book');
const Note = require('../models/Note');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const PastPaper = require('../models/PastPaper');
const Animation = require('../models/Animation');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Analytics = require('../models/Analytics');
const Question = require('../models/Question');
const Enrollment = require('../models/Enrollment');

// Get student dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const grade = req.user.grade;

    // Get all test results for overall stats
    const allTestResults = await TestResult.find({ student: studentId }).populate('test');
    const totalTests = allTestResults.length;
    const averageScore = totalTests > 0 ? allTestResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests : 0;

    // Get progress data
    const progressData = await Progress.find({ student: studentId }).populate('subject chapter');
    const completedCourses = progressData.filter(p => p.status === 'completed').length;
    const totalCourses = progressData.length;
    const studyHours = progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60; // convert to hours

    // Calculate streaks (simplified - in real app would track daily activity)
    const currentStreak = Math.floor(Math.random() * 15) + 1; // Mock streak calculation
    const longestStreak = Math.max(currentStreak, 18);

    // Get subjects progress
    const subjects = await Subject.find({ grades: grade, isActive: true });
    const subjectsProgress = subjects.map(subject => {
      const subjectProgress = progressData.filter(p => p.subject.toString() === subject._id.toString());
      const completedLessons = subjectProgress.filter(p => p.status === 'completed').length;
      const totalLessons = subjectProgress.length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const avgScore = subjectProgress.length > 0 ? subjectProgress.reduce((sum, p) => sum + (p.score || 0), 0) / subjectProgress.length : 0;

      return {
        name: subject.name,
        progress: Math.round(progress),
        completedLessons,
        totalLessons,
        averageScore: Math.round(avgScore),
        lastStudied: subjectProgress.length > 0 ? subjectProgress[0].lastAccessed?.toISOString().split('T')[0] : 'Never',
        nextMilestone: `Complete ${subject.name} basics`
      };
    });

    // Weekly stats (mock data - in real app would calculate from daily logs)
    const weeklyStats = [
      { day: "Mon", hours: 2.5, tests: 1 },
      { day: "Tue", hours: 3.0, tests: 0 },
      { day: "Wed", hours: 1.5, tests: 2 },
      { day: "Thu", hours: 4.0, tests: 1 },
      { day: "Fri", hours: 2.0, tests: 0 },
      { day: "Sat", hours: 5.5, tests: 3 },
      { day: "Sun", hours: 3.5, tests: 1 }
    ];

    // Recent activity from test results
    const recentActivity = allTestResults.slice(0, 5).map(result => ({
      title: `Completed ${result.test.title}`,
      description: `Scored ${result.percentage.toFixed(1)}%`,
      timeAgo: `${Math.floor((Date.now() - result.completedAt) / (1000 * 60 * 60 * 24))} days ago`
    }));

    res.json({
      success: true,
      data: {
        overall: {
          coursesCompleted: completedCourses,
          totalCourses,
          averageScore: Math.round(averageScore),
          studyHours: Math.round(studyHours),
          currentStreak,
          longestStreak
        },
        subjects: subjectsProgress,
        weeklyStats,
        recentActivity,
        goals: [
          { title: "Complete Cell Biology", progress: 75, status: "on-track", targetDate: "2024-03-15", description: "Finish all chapters and tests" },
          { title: "Score 90% in Genetics", progress: 45, status: "behind", targetDate: "2024-03-20", description: "Practice more MCQs" },
          { title: "Study 10 Hours/Week", progress: 100, status: "completed", targetDate: "2024-02-28", description: "Maintain consistency" }
        ],
        recentAchievements: [
          { title: "Fast Learner", description: "Completed 5 lessons in one day", date: "2 days ago", icon: "🚀" },
          { title: "Quiz Master", description: "Scored 100% on 3 consecutive quizzes", date: "1 week ago", icon: "🏆" },
          { title: "Bookworm", description: "Read for 10 hours total", date: "2 weeks ago", icon: "📚" }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subjects
exports.getSubjects = async (req, res) => {
  try {
    const grade = req.user.grade;
    const subjects = await Subject.find({ grade, isActive: true }).sort({ order: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chapters by subject
exports.getChapters = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId, isActive: true })
      .sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notes
exports.getNotes = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.query;
    const grade = req.user.grade;

    const filter = { grade, isActive: true };
    if (subjectId) filter.subject = subjectId;
    if (chapterId) filter.chapter = chapterId;

    const notes = await Note.find(filter)
      .populate('subject chapter')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single note
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)
      .populate('subject chapter');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.views += 1;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tests
exports.getTests = async (req, res) => {
  try {
    const { subjectId, type } = req.query;
    const grade = req.user.grade;

    const filter = { grade, isActive: true, isPublished: true };
    if (subjectId) filter.subject = subjectId;
    if (type) filter.type = type;

    const tests = await Test.find(filter)
      .populate('subject chapter')
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single test
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId)
      .populate('subject chapter questions');

    if (!test || !test.isActive || !test.isPublished) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit test
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers, timeTaken, startedAt } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    let score = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswerIndex;
      const marksAwarded = isCorrect ? question.marks : -question.negativeMarking;

      if (isCorrect) score += question.marks;
      else score += question.negativeMarking; // negative marking is already negative

      // Update question stats
      question.stats.totalAttempts += 1;
      if (isCorrect) question.stats.correctAttempts += 1;
      question.save();

      return {
        question: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        marksAwarded,
        timeSpent: answer.timeSpent || 0
      };
    });

    const percentage = (score / test.totalMarks) * 100;
    const status = score >= test.passingMarks ? 'passed' : 'failed';

    const result = await TestResult.create({
      test: testId,
      student: studentId,
      answers: processedAnswers,
      score,
      totalMarks: test.totalMarks,
      percentage,
      timeTaken,
      status,
      startedAt: new Date(startedAt),
      completedAt: new Date()
    });

    // Update analytics
    await updateStudentAnalytics(studentId, result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get test results
exports.getTestResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await TestResult.find({ student: studentId })
      .populate('test')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single test result
exports.getTestResult = async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.resultId)
      .populate({
        path: 'test',
        populate: { path: 'subject chapter' }
      })
      .populate({
        path: 'answers.question'
      });

    if (!result || result.student.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get past papers
exports.getPastPapers = async (req, res) => {
  try {
    const { subjectId, year } = req.query;
    const grade = req.user.grade;

    const filter = { grade, isActive: true };
    if (subjectId) filter.subject = subjectId;
    if (year) filter.year = parseInt(year);

    const papers = await PastPaper.find(filter)
      .populate('subject')
      .sort({ year: -1, term: 1 });

    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get animations
exports.getAnimations = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.query;
    const grade = req.user.grade;

    const filter = { grade, isActive: true };
    if (subjectId) filter.subject = subjectId;
    if (chapterId) filter.chapter = chapterId;

    const animations = await Animation.find(filter)
      .populate('subject chapter')
      .sort({ createdAt: -1 });

    res.json(animations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books
exports.getBooks = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const grade = req.user.grade;

    const filter = { grade, isActive: true };
    if (subjectId) filter.subject = subjectId;

    const books = await Book.find(filter)
      .populate('subject chapters')
      .sort({ title: 1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const studentId = req.user._id;
    const bookmarks = await Bookmark.find({ student: studentId })
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add bookmark
exports.addBookmark = async (req, res) => {
  try {
    const { type, resourceId, title, notes, tags } = req.body;
    const studentId = req.user._id;

    const bookmark = await Bookmark.create({
      student: studentId,
      type,
      resourceId,
      title,
      notes,
      tags
    });

    res.status(201).json(bookmark);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bookmark already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete bookmark
exports.deleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const studentId = req.user._id;

    const bookmark = await Bookmark.findOneAndDelete({
      _id: bookmarkId,
      student: studentId
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress
exports.getProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { subjectId } = req.query;

    const filter = { student: studentId };
    if (subjectId) filter.subject = subjectId;

    const progress = await Progress.find(filter)
      .populate('subject chapter')
      .sort({ lastAccessed: -1 });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update progress
exports.updateProgress = async (req, res) => {
  try {
    const { subjectId, chapterId, type, resourceId, progress, timeSpent } = req.body;
    const studentId = req.user._id;

    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';

    const progressRecord = await Progress.findOneAndUpdate(
      { student: studentId, type, resourceId },
      {
        subject: subjectId,
        chapter: chapterId,
        progress,
        status,
        timeSpent,
        lastAccessed: new Date(),
        ...(status === 'completed' && !progressRecord?.completedAt ? { completedAt: new Date() } : {})
      },
      { upsert: true, new: true }
    );

    res.json(progressRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;
    const analytics = await Analytics.findOne({ student: studentId })
      .sort({ date: -1 })
      .populate('subjectPerformance.subject weakTopics.subject strongTopics.subject');

    res.json(analytics || { metrics: {}, subjectPerformance: [], weakTopics: [], strongTopics: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update analytics
async function updateStudentAnalytics(studentId, testResult) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let analytics = await Analytics.findOne({ student: studentId, date: today });

  if (!analytics) {
    analytics = new Analytics({
      student: studentId,
      date: today,
      metrics: {}
    });
  }

  analytics.metrics.testsCompleted = (analytics.metrics.testsCompleted || 0) + 1;
  analytics.metrics.questionsAnswered = (analytics.metrics.questionsAnswered || 0) + testResult.answers.length;
  analytics.metrics.correctAnswers = (analytics.metrics.correctAnswers || 0) +
    testResult.answers.filter(a => a.isCorrect).length;

  const totalTests = analytics.metrics.testsCompleted;
  const currentAvg = analytics.metrics.averageScore || 0;
  analytics.metrics.averageScore = ((currentAvg * (totalTests - 1)) + testResult.percentage) / totalTests;

  await analytics.save();
}

// Get enrollments
exports.getEnrollments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status } = req.query;

    const filter = { student: studentId };
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate('book')
      .populate('currentChapter')
      .sort({ lastAccessedAt: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll in a book/course
exports.enrollInBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const studentId = req.user._id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ error: 'Book not found or not available' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      book: bookId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        error: 'Already enrolled in this book',
        enrollment: existingEnrollment
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      book: bookId,
      status: 'active',
      progress: 0
    });

    await enrollment.populate('book');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in book',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update enrollment progress
exports.updateEnrollmentProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, currentChapter, completedChapters } = req.body;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: studentId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (progress !== undefined) enrollment.progress = progress;
    if (currentChapter) enrollment.currentChapter = currentChapter;
    if (completedChapters) enrollment.completedChapters = completedChapters;

    enrollment.lastAccessedAt = new Date();

    // Mark as completed if progress is 100%
    if (progress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();
    await enrollment.populate('book currentChapter');

    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unenroll from a book
exports.unenrollFromBook = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: studentId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    res.json({
      success: true,
      message: 'Successfully unenrolled from book'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate enrolled book
exports.rateEnrolledBook = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { rating } = req.body;
    const studentId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: studentId
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollment.rating = rating;
    await enrollment.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
