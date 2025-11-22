const PastPaper = require('../models/PastPaper');
const fileService = require('../services/fileService');

exports.getAllPastPapers = async (req, res) => {
  try {
    const { subject, year, examBoard, grade, type } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (year) filter.year = parseInt(year);
    if (examBoard) filter.examBoard = examBoard;
    if (grade) filter.grade = grade;
    if (type) filter.type = type;

    const pastPapers = await PastPaper.find(filter)
      .populate('subject', 'name code')
      .sort({ year: -1, month: -1 });

    res.json({ success: true, data: { pastPapers } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPastPaperById = async (req, res) => {
  try {
    const pastPaper = await PastPaper.findById(req.params.paperId)
      .populate('subject', 'name code');

    if (!pastPaper) {
      return res.status(404).json({ success: false, error: 'Past paper not found' });
    }

    pastPaper.downloads += 1;
    await pastPaper.save();

    res.json({ success: true, data: { pastPaper } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createPastPaper = async (req, res) => {
  try {
    const { title, subject, year, month, examBoard, grade, type, duration, totalMarks } = req.body;

    const pastPaper = await PastPaper.create({
      title,
      subject,
      year,
      month,
      examBoard,
      grade,
      type,
      duration,
      totalMarks,
      uploadedBy: req.user._id,
      isActive: true
    });

    res.status(201).json({ success: true, data: { pastPaper }, message: 'Past paper created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePastPaper = async (req, res) => {
  try {
    const pastPaper = await PastPaper.findByIdAndUpdate(
      req.params.paperId,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject');

    if (!pastPaper) {
      return res.status(404).json({ success: false, error: 'Past paper not found' });
    }

    res.json({ success: true, data: { pastPaper }, message: 'Past paper updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePastPaper = async (req, res) => {
  try {
    const pastPaper = await PastPaper.findByIdAndDelete(req.params.paperId);

    if (!pastPaper) {
      return res.status(404).json({ success: false, error: 'Past paper not found' });
    }

    if (pastPaper.questionPaperUrl) await fileService.deleteFile(pastPaper.questionPaperUrl);
    if (pastPaper.markingSchemeUrl) await fileService.deleteFile(pastPaper.markingSchemeUrl);

    res.json({ success: true, message: 'Past paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadPastPaperFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { paperId } = req.params;
    const { type } = req.body;
    
    const fileUrl = `/uploads/past-papers/${req.file.filename}`;
    const updateField = type === 'markingScheme' ? 'markingSchemeUrl' : 'questionPaperUrl';

    const pastPaper = await PastPaper.findByIdAndUpdate(
      paperId,
      { [updateField]: fileUrl },
      { new: true }
    );

    if (!pastPaper) {
      return res.status(404).json({ success: false, error: 'Past paper not found' });
    }

    res.json({ success: true, data: { pastPaper }, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.downloadPastPaper = async (req, res) => {
  try {
    const { paperId, type } = req.params;
    
    const pastPaper = await PastPaper.findById(paperId);
    
    if (!pastPaper) {
      return res.status(404).json({ success: false, error: 'Past paper not found' });
    }

    const fileUrl = type === 'markingScheme' ? pastPaper.markingSchemeUrl : pastPaper.questionPaperUrl;
    
    if (!fileUrl) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: { fileUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
