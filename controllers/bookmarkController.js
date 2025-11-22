const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { student: req.user._id };
    
    if (type) filter.contentType = type;

    const bookmarks = await Bookmark.find(filter)
      .populate('contentRef')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { bookmarks } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBookmark = async (req, res) => {
  try {
    const { contentType, contentRef, title, description } = req.body;

    const existingBookmark = await Bookmark.findOne({
      student: req.user._id,
      contentType,
      contentRef
    });

    if (existingBookmark) {
      return res.status(400).json({ success: false, error: 'Bookmark already exists' });
    }

    const bookmark = await Bookmark.create({
      student: req.user._id,
      contentType,
      contentRef,
      title,
      description
    });

    res.status(201).json({ success: true, data: { bookmark }, message: 'Bookmark added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.bookmarkId,
      student: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, error: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { contentType, contentRef, title, description } = req.body;

    const existingBookmark = await Bookmark.findOne({
      student: req.user._id,
      contentType,
      contentRef
    });

    if (existingBookmark) {
      await existingBookmark.deleteOne();
      return res.json({ success: true, data: { bookmarked: false }, message: 'Bookmark removed' });
    }

    const bookmark = await Bookmark.create({
      student: req.user._id,
      contentType,
      contentRef,
      title,
      description
    });

    res.json({ success: true, data: { bookmarked: true, bookmark }, message: 'Bookmark added' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
