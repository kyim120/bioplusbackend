const Book = require('../models/Book');
const Chapter = require('../models/Chapter');
const Note = require('../models/Note');
const Test = require('../models/Test');
const Question = require('../models/Question');

const seedGrade9BiologyBook = async (adminUser, biologySubject) => {
  console.log('📚 Seeding Grade 9 Biology Book...');

  // Create Grade 9 Biology Book
  const bioBook9 = await Book.create({
    title: "Introduction to Biology - Grade 9",
    author: "Bio Plus Team",
    description: "Basic concepts of biology, cell structure, and living organisms",
    subject: biologySubject._id,
    grade: "9",
    totalPages: 250,
    coverImage: "/images/bio-grade-9.jpg",
    isbn: "978-0-123456-78-9",
    publisher: "Bio Plus Education",
    publishedDate: new Date('2024-01-01'),
    language: "English",
    isActive: true,
    createdBy: adminUser._id
  });

  console.log(`✅ Created book: ${bioBook9.title}`);

  // Create 8 chapters matching the mock data
  const chaptersData = [
    {
      name: "What is Biology?",
      chapterNumber: 1,
      description: "Introduction to the science of life and its branches",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.25, // 15 min
      difficulty: "easy",
      learningObjectives: [
        "Define biology and understand its scope",
        "Identify major branches of biology",
        "Understand the scientific method in biology"
      ],
      order: 1,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Characteristics of Living Organisms",
      chapterNumber: 2,
      description: "Seven characteristics that define life",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.33, // 20 min
      difficulty: "easy",
      learningObjectives: [
        "List and explain the seven characteristics of life",
        "Distinguish between living and non-living things",
        "Apply characteristics to classify organisms"
      ],
      order: 2,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Levels of Organization",
      chapterNumber: 3,
      description: "From atoms to biosphere - understanding biological hierarchy",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.42, // 25 min
      difficulty: "medium",
      learningObjectives: [
        "Describe the levels of biological organization",
        "Explain the relationship between different levels",
        "Identify examples at each organizational level"
      ],
      order: 3,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Cell Theory",
      chapterNumber: 4,
      description: "Fundamental principles of cell biology",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.5, // 30 min
      difficulty: "medium",
      learningObjectives: [
        "State the three principles of cell theory",
        "Understand the history of cell discovery",
        "Explain why cells are the basic unit of life"
      ],
      order: 4,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Cell Structure and Function",
      chapterNumber: 5,
      description: "Components of prokaryotic and eukaryotic cells",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.58, // 35 min
      difficulty: "hard",
      learningObjectives: [
        "Identify major cell organelles and their functions",
        "Compare prokaryotic and eukaryotic cells",
        "Understand the structure of cell membrane"
      ],
      order: 5,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Cell Membrane and Transport",
      chapterNumber: 6,
      description: "How substances move in and out of cells",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.47, // 28 min
      difficulty: "medium",
      learningObjectives: [
        "Describe the structure of cell membrane",
        "Explain passive and active transport",
        "Understand osmosis and diffusion"
      ],
      order: 6,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Enzymes and Biochemical Reactions",
      chapterNumber: 7,
      description: "Biological catalysts and their role in metabolism",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.53, // 32 min
      difficulty: "hard",
      learningObjectives: [
        "Define enzymes and their function",
        "Explain enzyme specificity and lock-and-key model",
        "Understand factors affecting enzyme activity"
      ],
      order: 7,
      isActive: true,
      createdBy: adminUser._id
    },
    {
      name: "Photosynthesis",
      chapterNumber: 8,
      description: "How plants convert light energy into chemical energy",
      subject: biologySubject._id,
      grade: "9",
      book: bioBook9._id,
      estimatedHours: 0.67, // 40 min
      difficulty: "hard",
      learningObjectives: [
        "Explain the process of photosynthesis",
        "Understand light and dark reactions",
        "Identify factors affecting photosynthesis rate"
      ],
      order: 8,
      isActive: true,
      createdBy: adminUser._id
    }
  ];

  const chapters = await Chapter.insertMany(chaptersData);
  console.log(`✅ Created ${chapters.length} chapters`);

  // Link chapters to book
  bioBook9.chapters = chapters.map(c => c._id);
  await bioBook9.save();

  // Create notes for each chapter
  const notesPromises = chapters.map(async (chapter) => {
    return await Note.create({
      title: `${chapter.name} - Complete Notes`,
      content: `# ${chapter.name}\n\n${chapter.description}\n\n## Key Points\n\n${chapter.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\n## Summary\n\nDetailed notes for ${chapter.name} covering all essential topics and concepts for Grade 9 Biology students.`,
      chapter: chapter._id,
      subject: biologySubject._id,
      grade: "9",
      fileType: "markdown",
      tags: ["biology", "grade-9", chapter.name.toLowerCase().replace(/\s+/g, '-')],
      isActive: true,
      createdBy: adminUser._id
    });
  });

  const notes = await Promise.all(notesPromises);
  console.log(`✅ Created ${notes.length} notes`);

  // Create sample questions for tests
  const questionsData = chapters.slice(0, 3).flatMap((chapter, chapterIndex) => [
    {
      text: `Which of the following best describes ${chapter.name}?`,
      type: "MCQ",
      chapter: chapter._id,
      subject: biologySubject._id,
      grade: "9",
      difficulty: chapter.difficulty,
      options: [
        { text: "Option A", isCorrect: true },
        { text: "Option B", isCorrect: false },
        { text: "Option C", isCorrect: false },
        { text: "Option D", isCorrect: false }
      ],
      correctAnswer: "Option A",
      explanation: `This relates to the key concepts in ${chapter.name}.`,
      points: 1,
      tags: ["biology", "grade-9"],
      isActive: true,
      createdBy: adminUser._id
    },
    {
      text: `Explain the main concept of ${chapter.name}.`,
      type: "Short Answer",
      chapter: chapter._id,
      subject: biologySubject._id,
      grade: "9",
      difficulty: chapter.difficulty,
      correctAnswer: `The main concept involves understanding ${chapter.description}`,
      points: 2,
      tags: ["biology", "grade-9"],
      isActive: true,
      createdBy: adminUser._id
    }
  ]);

  const questions = await Question.insertMany(questionsData);
  console.log(`✅ Created ${questions.length} questions`);

  // Create tests for chapters
  const testsPromises = chapters.slice(0, 3).map(async (chapter) => {
    const chapterQuestions = questions.filter(q => 
      q.chapter.toString() === chapter._id.toString()
    );

    return await Test.create({
      title: `${chapter.name} - Quiz`,
      description: `Test your knowledge of ${chapter.name}`,
      chapter: chapter._id,
      subject: biologySubject._id,
      grade: "9",
      duration: 15, // 15 minutes
      totalMarks: chapterQuestions.reduce((sum, q) => sum + q.points, 0),
      passingMarks: Math.floor(chapterQuestions.reduce((sum, q) => sum + q.points, 0) * 0.4),
      questions: chapterQuestions.map(q => q._id),
      difficulty: chapter.difficulty,
      isActive: true,
      createdBy: adminUser._id
    });
  });

  const tests = await Promise.all(testsPromises);
  console.log(`✅ Created ${tests.length} tests`);

  console.log('🎉 Grade 9 Biology book seeding complete!');
  
  return { bioBook9, chapters, notes, questions, tests };
};

module.exports = { seedGrade9BiologyBook };
