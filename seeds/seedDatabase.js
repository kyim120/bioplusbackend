require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Note = require('../models/Note');
const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const PastPaper = require('../models/PastPaper');
const Animation = require('../models/Animation');
const Bookmark = require('../models/Bookmark');
const QuickRevise = require('../models/QuickRevise');
const Book = require('../models/Book');
const Subscription = require('../models/Subscription');
const Analytics = require('../models/Analytics');
const Profile = require('../models/Profile');
const Progress = require('../models/Progress');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Chapter.deleteMany({});
    await Note.deleteMany({});
    await Test.deleteMany({});
    await TestResult.deleteMany({});
    await PastPaper.deleteMany({});
    await Animation.deleteMany({});
    await Bookmark.deleteMany({});
    await QuickRevise.deleteMany({});
    await Book.deleteMany({});
    await Subscription.deleteMany({});
    await Analytics.deleteMany({});
    await Profile.deleteMany({});
    await Progress.deleteMany({});
    await Question.deleteMany({});
    await Notification.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create owner account
    const owner = await User.create({
      email: 'owner@bioplus.com',
      password: await bcrypt.hash('owner123', 10),
      firstName: 'System',
      lastName: 'Owner',
      role: 'owner',
      status: 'active'
    });
    console.log('✅ Owner created:', owner.email);

    // Create admin account
    const admin = await User.create({
      email: 'admin@bioplus.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active'
    });
    console.log('✅ Admin created:', admin.email);

    // Create demo student account
    const student = await User.create({
      email: 'student@bioplus.com',
      password: await bcrypt.hash('student123', 10),
      firstName: 'Demo',
      lastName: 'Student',
      role: 'student',
      grade: '10',
      status: 'active'
    });
    console.log('✅ Student created:', student.email);

    // Create additional demo students
    const students = await User.insertMany([
      {
        email: 'student2@bioplus.com',
        password: await bcrypt.hash('student123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        grade: '11',
        status: 'active'
      },
      {
        email: 'student3@bioplus.com',
        password: await bcrypt.hash('student123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        role: '9',
        status: 'active'
      }
    ]);
    console.log('✅ Additional students created');

    // Create subjects
    const biology = await Subject.create({
      name: 'Biology',
      code: 'BIO',
      description: 'Study of living organisms',
      grades: ['9', '10', '11', '12'],
      isActive: true
    });

    const chemistry = await Subject.create({
      name: 'Chemistry',
      code: 'CHEM',
      description: 'Study of matter and its properties',
      grades: ['9', '10', '11', '12'],
      isActive: true
    });

    const physics = await Subject.create({
      name: 'Physics',
      code: 'PHY',
      description: 'Study of matter, energy, and forces',
      grades: ['9', '10', '11', '12'],
      isActive: true
    });

    console.log('✅ Subjects created');

    // Create chapters for Biology
    const bioChapters = await Chapter.insertMany([
      {
        subject: biology._id,
        title: 'Cell Structure and Function',
        chapterNumber: 1,
        description: 'Understanding the basic unit of life',
        grade: '10',
        order: 1
      },
      {
        subject: biology._id,
        title: 'Genetics and Heredity',
        chapterNumber: 2,
        description: 'DNA, genes, and inheritance patterns',
        grade: '10',
        order: 2
      },
      {
        subject: biology._id,
        title: 'Evolution and Natural Selection',
        chapterNumber: 3,
        description: 'Theory of evolution and adaptation',
        grade: '10',
        order: 3
      },
      {
        subject: biology._id,
        title: 'Ecosystems and Biodiversity',
        chapterNumber: 4,
        description: 'Interactions between organisms and their environment',
        grade: '10',
        order: 4
      },
      {
        subject: biology._id,
        title: 'Human Physiology',
        chapterNumber: 5,
        description: 'Systems and functions of the human body',
        grade: '10',
        order: 5
      }
    ]);

    // Create chapters for Chemistry
    const chemChapters = await Chapter.insertMany([
      {
        subject: chemistry._id,
        title: 'Atomic Structure',
        chapterNumber: 1,
        description: 'Structure of atoms and elements',
        grade: '10',
        order: 1
      },
      {
        subject: chemistry._id,
        title: 'Chemical Bonding',
        chapterNumber: 2,
        description: 'Types of chemical bonds and molecular structures',
        grade: '10',
        order: 2
      },
      {
        subject: chemistry._id,
        title: 'Acids, Bases and Salts',
        chapterNumber: 3,
        description: 'Properties and reactions of acids and bases',
        grade: '10',
        order: 3
      }
    ]);

    console.log('✅ Chapters created');

    // Create questions
    const questions = await Question.insertMany([
      {
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
        correctAnswer: 1,
        difficulty: 'easy',
        subject: biology._id,
        chapter: bioChapters[0]._id,
        grade: '10',
        explanation: 'Mitochondria are known as the powerhouse of the cell because they generate ATP, the energy currency of the cell.'
      },
      {
        question: 'Which organelle is responsible for protein synthesis?',
        options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Lysosome'],
        correctAnswer: 1,
        difficulty: 'medium',
        subject: biology._id,
        chapter: bioChapters[0]._id,
        grade: '10',
        explanation: 'Ribosomes are responsible for protein synthesis in the cell.'
      },
      {
        question: 'What is the basic unit of heredity?',
        options: ['Chromosome', 'Gene', 'DNA', 'RNA'],
        correctAnswer: 1,
        difficulty: 'easy',
        subject: biology._id,
        chapter: bioChapters[1]._id,
        grade: '10',
        explanation: 'A gene is the basic unit of heredity that carries genetic information.'
      },
      {
        question: 'What is the process by which organisms better adapted to their environment tend to survive and produce more offspring?',
        options: ['Evolution', 'Natural Selection', 'Adaptation', 'Mutation'],
        correctAnswer: 1,
        difficulty: 'medium',
        subject: biology._id,
        chapter: bioChapters[2]._id,
        grade: '10',
        explanation: 'Natural selection is the process where organisms better adapted to their environment survive and reproduce more successfully.'
      },
      {
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'O2', 'NaCl'],
        correctAnswer: 0,
        difficulty: 'easy',
        subject: chemistry._id,
        chapter: chemChapters[0]._id,
        grade: '10',
        explanation: 'H2O is the chemical formula for water, consisting of 2 hydrogen atoms and 1 oxygen atom.'
      }
    ]);

    console.log('✅ Questions created');

    // Create tests
    const tests = await Test.insertMany([
      {
        title: 'Cell Biology Fundamentals',
        description: 'Test your knowledge of cell structure and function',
        subject: biology._id,
        chapter: bioChapters[0]._id,
        grade: '10',
        questions: [questions[0]._id, questions[1]._id],
        duration: 30,
        totalMarks: 20,
        passingMarks: 14,
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Genetics and Heredity',
        description: 'Comprehensive test on genetics concepts',
        subject: biology._id,
        chapter: bioChapters[1]._id,
        grade: '10',
        questions: [questions[2]._id],
        duration: 25,
        totalMarks: 10,
        passingMarks: 7,
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Evolution Quiz',
        description: 'Test on evolutionary concepts',
        subject: biology._id,
        chapter: bioChapters[2]._id,
        grade: '10',
        questions: [questions[3]._id],
        duration: 20,
        totalMarks: 10,
        passingMarks: 6,
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Chemistry Basics',
        description: 'Fundamental chemistry concepts',
        subject: chemistry._id,
        chapter: chemChapters[0]._id,
        grade: '10',
        questions: [questions[4]._id],
        duration: 15,
        totalMarks: 10,
        passingMarks: 7,
        isActive: true,
        createdBy: admin._id
      }
    ]);

    console.log('✅ Tests created');

    // Create test results
    await TestResult.insertMany([
      {
        student: student._id,
        test: tests[0]._id,
        answers: [
          { question: questions[0]._id, selectedAnswer: 1, isCorrect: true },
          { question: questions[1]._id, selectedAnswer: 1, isCorrect: true }
        ],
        score: 20,
        totalQuestions: 2,
        correctAnswers: 2,
        timeTaken: 25,
        completedAt: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        student: student._id,
        test: tests[1]._id,
        answers: [
          { question: questions[2]._id, selectedAnswer: 1, isCorrect: true }
        ],
        score: 10,
        totalQuestions: 1,
        correctAnswers: 1,
        timeTaken: 15,
        completedAt: new Date('2024-01-16'),
        status: 'completed'
      }
    ]);

    console.log('✅ Test results created');

    // Create notes
    await Note.insertMany([
      {
        title: 'Cell Structure Notes',
        content: 'Detailed notes on cell organelles and their functions...',
        subject: biology._id,
        chapter: bioChapters[0]._id,
        grade: '10',
        createdBy: admin._id,
        isPublic: true
      },
      {
        title: 'Genetics Study Guide',
        content: 'Comprehensive guide to genetics and heredity concepts...',
        subject: biology._id,
        chapter: bioChapters[1]._id,
        grade: '10',
        createdBy: admin._id,
        isPublic: true
      },
      {
        title: 'Evolution Theory',
        content: 'Notes on Darwin\'s theory of evolution and natural selection...',
        subject: biology._id,
        chapter: bioChapters[2]._id,
        grade: '10',
        createdBy: admin._id,
        isPublic: true
      }
    ]);

    console.log('✅ Notes created');

    // Create past papers
    await PastPaper.insertMany([
      {
        title: 'Biology Mid-term Exam 2023',
        subject: biology._id,
        grade: '10',
        year: 2023,
        examType: 'mid-term',
        fileUrl: '/uploads/past-papers/bio-mid-2023.pdf',
        totalMarks: 100,
        duration: 120,
        isActive: true,
        uploadedBy: admin._id
      },
      {
        title: 'Chemistry Final Exam 2023',
        subject: chemistry._id,
        grade: '10',
        year: 2023,
        examType: 'final',
        fileUrl: '/uploads/past-papers/chem-final-2023.pdf',
        totalMarks: 100,
        duration: 150,
        isActive: true,
        uploadedBy: admin._id
      }
    ]);

    console.log('✅ Past papers created');

    // Create animations
    await Animation.insertMany([
      {
        title: 'Cell Division Process',
        description: 'Animated explanation of mitosis and meiosis',
        subject: biology._id,
        chapter: bioChapters[0]._id,
        grade: '10',
        videoUrl: 'https://example.com/videos/cell-division.mp4',
        thumbnailUrl: '/uploads/thumbnails/cell-division.jpg',
        duration: 300,
        isActive: true,
        uploadedBy: admin._id
      },
      {
        title: 'DNA Replication',
        description: 'How DNA replicates during cell division',
        subject: biology._id,
        chapter: bioChapters[1]._id,
        grade: '10',
        videoUrl: 'https://example.com/videos/dna-replication.mp4',
        thumbnailUrl: '/uploads/thumbnails/dna-replication.jpg',
        duration: 240,
        isActive: true,
        uploadedBy: admin._id
      }
    ]);

    console.log('✅ Animations created');

    // Create books
    await Book.insertMany([
      {
        title: 'Biology Grade 10 Textbook',
        author: 'Bio Plus Team',
        subject: biology._id,
        grade: '10',
        description: 'Comprehensive biology textbook for grade 10 students',
        fileUrl: '/uploads/books/bio-grade10.pdf',
        coverImageUrl: '/uploads/covers/bio-grade10.jpg',
        totalPages: 250,
        isActive: true,
        uploadedBy: admin._id
      },
      {
        title: 'Chemistry Fundamentals',
        author: 'Chemistry Experts',
        subject: chemistry._id,
        grade: '10',
        description: 'Introduction to basic chemistry concepts',
        fileUrl: '/uploads/books/chemistry-basics.pdf',
        coverImageUrl: '/uploads/covers/chemistry-basics.jpg',
        totalPages: 200,
        isActive: true,
        uploadedBy: admin._id
      }
    ]);

    console.log('✅ Books created');

    // Create quick revise flashcards
    await QuickRevise.insertMany([
      {
        question: 'What is photosynthesis?',
        answer: 'The process by which plants convert light energy into chemical energy',
        subject: biology._id,
        chapter: bioChapters[3]._id,
        grade: '10',
        difficulty: 'easy',
        createdBy: admin._id
      },
      {
        question: 'What is the pH scale range?',
        answer: '0 to 14, where 7 is neutral, below 7 is acidic, above 7 is basic',
        subject: chemistry._id,
        chapter: chemChapters[2]._id,
        grade: '10',
        difficulty: 'medium',
        createdBy: admin._id
      }
    ]);

    console.log('✅ Quick revise flashcards created');

    // Create bookmarks for student
    await Bookmark.insertMany([
      {
        student: student._id,
        note: null, // Will be set after notes are created
        type: 'note',
        title: 'Cell Structure Notes',
        page: 1,
        createdAt: new Date()
      }
    ]);

    console.log('✅ Bookmarks created');

    // Create progress tracking
    await Progress.insertMany([
      {
        student: student._id,
        subject: biology._id,
        chapter: bioChapters[0]._id,
        completedLessons: 5,
        totalLessons: 8,
        progressPercentage: 62.5,
        lastStudied: new Date('2024-01-20'),
        timeSpent: 180 // minutes
      },
      {
        student: student._id,
        subject: biology._id,
        chapter: bioChapters[1]._id,
        completedLessons: 3,
        totalLessons: 6,
        progressPercentage: 50,
        lastStudied: new Date('2024-01-19'),
        timeSpent: 120
      }
    ]);

    console.log('✅ Progress tracking created');

    // Create profiles
    await Profile.insertMany([
      {
        user: student._id,
        bio: 'Dedicated biology student passionate about learning',
        avatar: '/uploads/avatars/student.jpg',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        achievements: ['First Test Completed', 'Perfect Score'],
        stats: {
          totalTests: 5,
          averageScore: 85,
          studyStreak: 12,
          totalStudyTime: 450
        }
      }
    ]);

    console.log('✅ Profiles created');

    // Create subscriptions
    await Subscription.insertMany([
      {
        user: student._id,
        plan: 'premium',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        features: ['unlimited_tests', 'premium_content', 'ai_assistant']
      }
    ]);

    console.log('✅ Subscriptions created');

    // Create analytics data
    await Analytics.insertMany([
      {
        type: 'user_engagement',
        data: {
          totalUsers: 150,
          activeUsers: 89,
          newRegistrations: 12,
          testCompletions: 234
        },
        date: new Date(),
        period: 'daily'
      }
    ]);

    console.log('✅ Analytics data created');

    // Create notifications
    await Notification.insertMany([
      {
        user: student._id,
        title: 'New Test Available',
        message: 'A new biology test has been added to your dashboard',
        type: 'info',
        isRead: false,
        createdAt: new Date()
      },
      {
        user: student._id,
        title: 'Achievement Unlocked',
        message: 'Congratulations! You\'ve completed 5 tests',
        type: 'achievement',
        isRead: false,
        createdAt: new Date()
      }
    ]);

    console.log('✅ Notifications created');

    console.log('\n🎉 Database seeded successfully with comprehensive mock data!');
    console.log('\n📝 Demo Accounts:');
    console.log('Owner: owner@bioplus.com / owner123');
    console.log('Admin: admin@bioplus.com / admin123');
    console.log('Student: student@bioplus.com / student123');
    console.log('Student 2: student2@bioplus.com / student123');
    console.log('Student 3: student3@bioplus.com / student123');

    console.log('\n📊 Mock Data Summary:');
    console.log('- 3 Subjects (Biology, Chemistry, Physics)');
    console.log('- 8 Chapters');
    console.log('- 5 Questions');
    console.log('- 4 Tests');
    console.log('- 2 Test Results');
    console.log('- 3 Notes');
    console.log('- 2 Past Papers');
    console.log('- 2 Animations');
    console.log('- 2 Books');
    console.log('- 2 Quick Revise Cards');
    console.log('- Progress tracking');
    console.log('- User profiles and subscriptions');
    console.log('- Analytics and notifications');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
