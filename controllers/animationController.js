const Animation = require('../models/Animation');
const fileService = require('../services/fileService');

exports.getAllAnimations = async (req, res) => {
  try {
    const { subject, chapter, grade, search } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (grade) filter.grade = grade;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const animations = await Animation.find(filter)
      .populate('subject chapter uploadedBy', 'name title firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { animations } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnimationById = async (req, res) => {
  try {
    const animation = await Animation.findById(req.params.animationId)
      .populate('subject chapter uploadedBy', 'name title firstName lastName');

    if (!animation) {
      return res.status(404).json({ success: false, error: 'Animation not found' });
    }

    res.json({ success: true, data: { animation } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAnimation = async (req, res) => {
  try {
    const { title, description, subject, chapter, grade, duration, videoUrl, thumbnailUrl } = req.body;

    const animation = await Animation.create({
      title,
      description,
      subject,
      chapter,
      grade,
      duration,
      videoUrl,
      thumbnailUrl,
      uploadedBy: req.user._id,
      isActive: true,
      views: 0
    });

    res.status(201).json({ success: true, data: { animation }, message: 'Animation created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAnimation = async (req, res) => {
  try {
    const animation = await Animation.findByIdAndUpdate(
      req.params.animationId,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject chapter');

    if (!animation) {
      return res.status(404).json({ success: false, error: 'Animation not found' });
    }

    res.json({ success: true, data: { animation }, message: 'Animation updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAnimation = async (req, res) => {
  try {
    const animation = await Animation.findByIdAndDelete(req.params.animationId);

    if (!animation) {
      return res.status(404).json({ success: false, error: 'Animation not found' });
    }

    if (animation.videoUrl) await fileService.deleteFile(animation.videoUrl);
    if (animation.thumbnailUrl) await fileService.deleteFile(animation.thumbnailUrl);

    res.json({ success: true, message: 'Animation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { animationId } = req.params;
    const videoUrl = `/uploads/animations/${req.file.filename}`;

    const animation = await Animation.findByIdAndUpdate(
      animationId,
      { videoUrl },
      { new: true }
    );

    if (!animation) {
      return res.status(404).json({ success: false, error: 'Animation not found' });
    }

    res.json({ success: true, data: { animation }, message: 'Video uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.trackView = async (req, res) => {
  try {
    const { animationId } = req.params;
    
    const animation = await Animation.findById(animationId);
    
    if (!animation) {
      return res.status(404).json({ success: false, error: 'Animation not found' });
    }

    animation.views += 1;
    await animation.save();

    res.json({ success: true, message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
