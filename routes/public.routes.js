const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const PastPaper = require('../models/PastPaper');

// Public routes that don't require authentication

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get featured courses (public) - placeholder for future implementation
router.get('/courses/featured', async (req, res) => {
  try {
    // TODO: Implement actual featured courses from database
    const featuredCourses = [
      {
        id: "1",
        title: "Complete Web Development Bootcamp",
        description: "Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.",
        instructor: "John Doe",
        duration: "40 hours",
        students: 15420,
        rating: 4.8,
        price: 99.99,
        image: "/course-software.jpg",
        category: "Web Development",
        level: "Beginner to Advanced"
      },
      {
        id: "2",
        title: "Data Science with Python",
        description: "Master data analysis, visualization, and machine learning with Python.",
        instructor: "Jane Smith",
        duration: "35 hours",
        students: 12890,
        rating: 4.7,
        price: 89.99,
        image: "/course-finance.jpg",
        category: "Data Science",
        level: "Intermediate"
      },
      {
        id: "3",
        title: "Digital Marketing Mastery",
        description: "Learn SEO, social media marketing, content creation, and analytics.",
        instructor: "Mike Johnson",
        duration: "25 hours",
        students: 9876,
        rating: 4.6,
        price: 79.99,
        image: "/course-marketing.jpg",
        category: "Marketing",
        level: "All Levels"
      },
      {
        id: "4",
        title: "UI/UX Design Fundamentals",
        description: "Create beautiful and user-friendly interfaces with modern design principles.",
        instructor: "Sarah Wilson",
        duration: "30 hours",
        students: 7654,
        rating: 4.9,
        price: 69.99,
        image: "/course-3d.jpg",
        category: "Design",
        level: "Beginner"
      },
      {
        id: "5",
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps with React Native and Expo.",
        instructor: "David Brown",
        duration: "45 hours",
        students: 5432,
        rating: 4.5,
        price: 109.99,
        image: "/course-motion.jpg",
        category: "Mobile Development",
        level: "Intermediate"
      },
      {
        id: "6",
        title: "PHP & MySQL Web Development",
        description: "Learn server-side programming with PHP and database management with MySQL.",
        instructor: "Lisa Davis",
        duration: "38 hours",
        students: 4321,
        rating: 4.4,
        price: 84.99,
        image: "/course-php.jpg",
        category: "Web Development",
        level: "Beginner to Intermediate"
      }
    ];

    res.json({
      success: true,
      data: featuredCourses
    });
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured courses'
    });
  }
});

// Get public subjects
router.get('/subjects', async (req, res) => {
  try {
    const { grade } = req.query;
    const filter = { isActive: true };
    if (grade) filter.grade = grade;

    const subjects = await Subject.find(filter).sort({ order: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public past papers
router.get('/past-papers', async (req, res) => {
  try {
    const { grade, subjectId, year } = req.query;
    const filter = { isActive: true };
    if (grade) filter.grade = grade;
    if (subjectId) filter.subject = subjectId;
    if (year) filter.year = parseInt(year);

    const papers = await PastPaper.find(filter)
      .populate('subject')
      .sort({ year: -1, term: 1 })
      .limit(20);

    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
