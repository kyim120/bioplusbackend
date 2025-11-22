const Book = require('../models/Book');
const Progress = require('../models/Progress');
const fileService = require('../services/fileService');

exports.getAllBooks = async (req, res) => {
  try {
    const { subject, grade, search } = req.query;
    const filter = { isActive: true };
    
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const books = await Book.find(filter)
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { books } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
      .populate('subject', 'name code');

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, data: { book } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, description, subject, grade, isbn, publisher, edition, language, totalPages } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      subject,
      grade,
      isbn,
      publisher,
      edition,
      language,
      totalPages,
      uploadedBy: req.user._id,
      isActive: true
    });

    res.status(201).json({ success: true, data: { book }, message: 'Book created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject');

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, data: { book }, message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if (book.fileUrl) await fileService.deleteFile(book.fileUrl);
    if (book.coverImageUrl) await fileService.deleteFile(book.coverImageUrl);

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadBookFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { bookId } = req.params;
    const fileUrl = `/uploads/books/${req.file.filename}`;

    const book = await Book.findByIdAndUpdate(
      bookId,
      { fileUrl, fileSize: req.file.size },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, data: { book }, message: 'Book file uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId).select('chapters');
    
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    res.json({ success: true, data: { chapters: book.chapters || [] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get book with all chapters and progress
exports.getBookWithChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    const Chapter = require('../models/Chapter');
    const Progress = require('../models/Progress');
    
    const book = await Book.findById(bookId)
      .populate('subject', 'name code grade')
      .populate('createdBy', 'firstName lastName');

    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }

    // Get chapters for this book
    const chapters = await Chapter.find({ book: bookId })
      .sort('order')
      .select('name chapterNumber description estimatedHours difficulty learningObjectives order');

    // Get user progress if authenticated
    let progress = [];
    let completedChapters = 0;
    
    if (req.user) {
      const userProgress = await Progress.find({
        student: req.user._id,
        contentType: 'Chapter',
        contentRef: { $in: chapters.map(c => c._id) }
      });
      
      progress = userProgress;
      completedChapters = userProgress.filter(p => p.status === 'completed').length;
    }

    // Format chapters with status
    const formattedChapters = chapters.map((chapter, index) => {
      const chapterProgress = progress.find(
        p => p.contentRef.toString() === chapter._id.toString()
      );
      
      let status = 'locked';
      if (completedChapters >= index || index === 0) {
        status = chapterProgress?.status === 'completed' ? 'completed' : 
                 chapterProgress?.status === 'in-progress' ? 'in-progress' : 
                 'available';
      }
      
      return {
        id: chapter._id,
        title: chapter.name,
        description: chapter.description,
        status,
        readTime: `${Math.round(chapter.estimatedHours * 60)} min`,
        chapterNumber: chapter.chapterNumber
      };
    });

    res.json({ 
      success: true, 
      data: { 
        book: {
          title: book.title,
          description: book.description,
          totalChapters: chapters.length,
          completedChapters,
          author: book.author,
          grade: book.grade
        },
        chapters: formattedChapters
      } 
    });
  } catch (error) {
    console.error('Error fetching book with chapters:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.trackProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { currentPage, completed } = req.body;
    
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        student: req.user._id,
        contentType: 'Book',
        contentRef: bookId
      },
      {
        progress: (currentPage / book.totalPages) * 100,
        status: completed ? 'completed' : 'in-progress',
        lastAccessed: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { progress }, message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get popular books
exports.getPopularBooks = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true })
      .sort({ views: -1, likes: -1 })
      .limit(10)
      .populate('subject', 'name code');

    res.json({ success: true, data: { books } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recent books
exports.getRecentBooks = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('subject', 'name code');

    res.json({ success: true, data: { books } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { q, subject, grade } = req.query;
    const filter = { isActive: true };
    
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;

    const books = await Book.find(filter)
      .populate('subject', 'name code')
      .limit(50);

    res.json({ success: true, data: { books, count: books.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get reading progress
exports.getReadingProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const progress = await Progress.findOne({
      student: req.user._id,
      contentType: 'Book',
      contentRef: bookId
    });

    res.json({ success: true, data: { progress: progress || { progress: 0, status: 'not-started' } } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const progress = await Progress.findOneAndUpdate(
      {
        student: req.user._id,
        contentType: 'Book',
        contentRef: bookId
      },
      {
        progress: 100,
        status: 'completed',
        lastAccessed: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { progress }, message: 'Book marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Rate book
exports.rateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // Simple rating system - in production, you'd store individual ratings
    book.rating = ((book.rating || 0) + rating) / 2;
    await book.save();

    res.json({ success: true, data: { rating: book.rating }, message: 'Book rated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // Simple like counter - in production, you'd track who liked
    book.likes = (book.likes || 0) + 1;
    await book.save();

    res.json({ success: true, data: { likes: book.likes }, message: 'Book liked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get books by subject
exports.getBooksBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const books = await Book.find({ subject: subjectId, isActive: true })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { books } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get books by category
exports.getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const books = await Book.find({ category, isActive: true })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { books } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Aliases for route compatibility
exports.getBooks = exports.getAllBooks;
exports.getBook = exports.getBookById;

module.exports = exports;
