const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

exports.getAllSubjects = async (req, res) => {
  try {
    const { grade } = req.query;
    const filter = { isActive: true };
    
    if (grade) filter.grades = grade;

    const subjects = await Subject.find(filter).sort({ order: 1 });

    res.json({ success: true, data: { subjects } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const chapters = await Chapter.find({ subject: subject._id, isActive: true })
      .sort({ chapterNumber: 1 });

    res.json({ success: true, data: { subject, chapters } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, code, description, grades, icon, color, order } = req.body;

    const subject = await Subject.create({
      name,
      code,
      description,
      grades: grades || [],
      icon,
      color,
      order,
      isActive: true
    });

    res.status(201).json({ success: true, data: { subject }, message: 'Subject created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.subjectId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, data: { subject }, message: 'Subject updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.subjectId,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const chapters = await Chapter.find({ subject: subjectId, isActive: true })
      .sort({ chapterNumber: 1 });

    res.json({ success: true, data: { chapters } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createChapter = async (req, res) => {
  try {
    const { title, chapterNumber, description, subject, topics, learningObjectives } = req.body;

    const chapter = await Chapter.create({
      title,
      chapterNumber,
      description,
      subject,
      topics: topics || [],
      learningObjectives: learningObjectives || [],
      isActive: true
    });

    res.status(201).json({ success: true, data: { chapter }, message: 'Chapter created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    res.json({ success: true, data: { chapter }, message: 'Chapter updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(
      req.params.chapterId,
      { isActive: false },
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    res.json({ success: true, message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all chapters
exports.getChapters = async (req, res) => {
  try {
    const { subject, grade } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const chapters = await Chapter.find(filter).sort({ chapterNumber: 1 });
    res.json({ success: true, data: { chapters } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single chapter
exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).populate('subject');

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    res.json({ success: true, data: { chapter } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get subject progress (placeholder - can be enhanced with actual progress tracking)
exports.getSubjectProgress = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    // Mock progress data - in real app would calculate from user's completed chapters/tests
    const progress = {
      subjectId,
      overallProgress: 0,
      completedChapters: 0,
      totalChapters: 0,
      completedTests: 0,
      totalTests: 0,
      lastAccessed: null
    };

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get subject stats
exports.getSubjectStats = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const chapters = await Chapter.find({ subject: subjectId, isActive: true });
    
    const stats = {
      totalChapters: chapters.length,
      totalTopics: chapters.reduce((sum, ch) => sum + (ch.topics?.length || 0), 0),
      totalLearningObjectives: chapters.reduce((sum, ch) => sum + (ch.learningObjectives?.length || 0), 0)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update subject order
exports.updateSubjectOrder = async (req, res) => {
  try {
    const { subjects } = req.body; // Array of { id, order }
    
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ success: false, error: 'Subjects array is required' });
    }

    const updatePromises = subjects.map(({ id, order }) =>
      Subject.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Subject order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update chapter order
exports.updateChapterOrder = async (req, res) => {
  try {
    const { chapters } = req.body; // Array of { id, chapterNumber }
    
    if (!Array.isArray(chapters)) {
      return res.status(400).json({ success: false, error: 'Chapters array is required' });
    }

    const updatePromises = chapters.map(({ id, chapterNumber }) =>
      Chapter.findByIdAndUpdate(id, { chapterNumber }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Chapter order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Aliases for route compatibility
exports.getSubjects = exports.getAllSubjects;
exports.getSubject = exports.getSubjectById;

module.exports = exports;
