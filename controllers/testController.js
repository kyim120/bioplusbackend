const Test = require('../models/Test');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// Get all tests (admin)
exports.getAllTests = async (req, res) => {
  try {
    const { subject, grade, status } = req.query;
    const filter = {};
    
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (status) filter.status = status;

    const tests = await Test.find(filter)
      .populate('subject chapter questions')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { tests } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get test by ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId)
      .populate('subject chapter questions');

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({ success: true, data: { test } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create test (admin)
exports.createTest = async (req, res) => {
  try {
    const { title, description, subject, chapter, grade, duration, totalMarks, passingMarks, questions, type } = req.body;

    const test = await Test.create({
      title,
      description,
      subject,
      chapter,
      grade,
      duration,
      totalMarks,
      passingMarks,
      questions,
      type,
      createdBy: req.user._id,
      isActive: true,
      isPublished: false
    });

    res.status(201).json({ success: true, data: { test }, message: 'Test created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update test (admin)
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.testId,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject chapter questions');

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({ success: true, data: { test }, message: 'Test updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete test (admin)
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.testId);

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Start test (student)
exports.startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate('questions');
    
    if (!test || !test.isActive || !test.isPublished) {
      return res.status(404).json({ success: false, error: 'Test not available' });
    }

    const testAttempt = {
      test: test._id,
      questions: test.questions,
      startTime: new Date()
    };

    res.json({ success: true, data: { test, testAttempt } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Submit test (student)
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers, timeSpent } = req.body;
    
    const test = await Test.findById(testId).populate('questions');
    
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    let score = 0;
    let correctAnswers = 0;
    const resultDetails = [];

    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswerIndex === userAnswer;
      
      if (isCorrect) {
        score += question.marks || 1;
        correctAnswers++;
      }

      resultDetails.push({
        question: question._id,
        userAnswer,
        correctAnswer: question.correctAnswerIndex,
        isCorrect,
        marks: isCorrect ? (question.marks || 1) : 0
      });
    });

    const percentage = (score / test.totalMarks) * 100;
    const passed = percentage >= test.passingMarks;

    const testResult = await TestResult.create({
      student: req.user._id,
      test: testId,
      answers: resultDetails,
      score,
      totalMarks: test.totalMarks,
      percentage,
      passed,
      timeSpent,
      submittedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        result: testResult,
        score,
        totalMarks: test.totalMarks,
        percentage,
        passed,
        correctAnswers,
        totalQuestions: test.questions.length
      },
      message: passed ? 'Congratulations! You passed!' : 'Keep practicing!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get test results (student)
exports.getTestResults = async (req, res) => {
  try {
    const results = await TestResult.find({ student: req.user._id })
      .populate('test')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: { results } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
