const Note = require('../models/Note');
const fileService = require('../services/fileService');

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const { subject, chapter, grade, search } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (grade) filter.grade = grade;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const notes = await Note.find(filter)
      .populate('subject chapter createdBy', 'name title firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { notes } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)
      .populate('subject chapter createdBy', 'name title firstName lastName');

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    note.views += 1;
    await note.save();

    res.json({ success: true, data: { note } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create note (admin)
exports.createNote = async (req, res) => {
  try {
    const { title, content, subject, chapter, grade, topics } = req.body;

    const note = await Note.create({
      title,
      content,
      subject,
      chapter,
      grade,
      topics: topics || [],
      createdBy: req.user._id,
      isActive: true
    });

    res.status(201).json({ success: true, data: { note }, message: 'Note created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update note (admin)
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject chapter');

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, data: { note }, message: 'Note updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete note (admin)
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.fileUrl) {
      await fileService.deleteFile(note.fileUrl);
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload note file (admin)
exports.uploadNoteFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { noteId } = req.params;
    const fileUrl = `/uploads/notes/${req.file.filename}`;

    const note = await Note.findByIdAndUpdate(
      noteId,
      { fileUrl, fileType: req.file.mimetype },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.json({ success: true, data: { note }, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
