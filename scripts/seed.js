require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Book = require('../models/Book');
const { USER_ROLES, USER_STATUS, GRADES } = require('../utils/constants');
const { seedGrade9BiologyBook } = require('../seeds/seedGrade9Biology');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Chapter.deleteMany({});
    await Book.deleteMany({});

    // Create demo users
    console.log('👤 Creating demo users...');

    const demoUsers = [
      {
        firstName: 'Demo',
        lastName: 'Student',
        email: 'student@demo.com',
        password: 'student123',
        role: USER_ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
        grade: '10',
        profile: {
          bio: 'Demo Student Account',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        }
      },
      {
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@demo.com',
        password: 'admin123',
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
        grade: null,
        profile: {
          bio: 'Demo Admin Account',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        }
      },
      {
        firstName: 'Demo',
        lastName: 'Owner',
        email: 'owner@demo.com',
        password: 'owner123',
        role: USER_ROLES.OWNER,
        status: USER_STATUS.ACTIVE,
        grade: null,
        profile: {
          bio: 'Demo Owner Account',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        }
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    const adminUser = createdUsers.find(u => u.role === USER_ROLES.ADMIN);

    // Create sample subjects
    console.log('📚 Creating sample subjects...');
    const subjects = [
      {
        name: 'Cell Biology',
        code: 'CELL',
        grade: '10',
        description: 'Study of cell structure and function',
        order: 1,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Genetics',
        code: 'GENE',
        grade: '11',
        description: 'Study of genes and heredity',
        order: 2,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Ecology',
        code: 'ECOL',
        grade: '12',
        description: 'Study of organisms and their environment',
        order: 3,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Human Biology',
        code: 'HUMB',
        grade: '9',
        description: 'Study of human body systems',
        order: 4,
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);

    // Create sample chapters for Cell Biology
    console.log('📖 Creating sample chapters...');
    const cellBiologySubject = createdSubjects.find(s => s.code === 'CELL');

    const chapters = [
      {
        name: 'Cell Structure',
        chapterNumber: 1,
        description: 'Introduction to cell components and organelles',
        subject: cellBiologySubject._id,
        learningObjectives: [
          'Identify major cell organelles',
          'Understand cell membrane structure',
          'Describe cellular transport mechanisms'
        ],
        order: 1,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Cell Division',
        chapterNumber: 2,
        description: 'Mitosis and meiosis processes',
        subject: cellBiologySubject._id,
        learningObjectives: [
          'Explain the process of mitosis',
          'Describe meiosis and its significance',
          'Compare mitosis and meiosis'
        ],
        order: 2,
        isActive: true,
        createdBy: adminUser._id
      },
      {
        name: 'Cell Metabolism',
        chapterNumber: 3,
        description: 'Energy production and cellular respiration',
        subject: cellBiologySubject._id,
        learningObjectives: [
          'Understand ATP and energy in cells',
          'Explain glycolysis and Krebs cycle',
          'Describe photosynthesis process'
        ],
        order: 3,
        isActive: true,
        createdBy: adminUser._id
      }
    ];

    await Chapter.insertMany(chapters);

    // Seed Grade 9 Biology Book with all chapters and content
    console.log('\n📚 Seeding Grade 9 Biology Book...');
    await seedGrade9BiologyBook(adminUser, cellBiologySubject);

    // Create sample student users
    console.log('\n🎓 Creating sample student users...');
    const students = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@student.com',
        password: 'Student123!',
        role: USER_ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
        grade: '10',
        profile: {
          bio: 'Biology enthusiast',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        }
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@student.com',
        password: 'Student123!',
        role: USER_ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
        grade: '11',
        profile: {
          bio: 'Science lover',
          avatar: null,
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          }
        }
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@student.com',
        password: 'Student123!',
        role: USER_ROLES.STUDENT,
        status: USER_STATUS.ACTIVE,
        grade: '12',
        profile: {
          bio: 'Future biologist',
          avatar: null,
          preferences: {
            theme: 'light',
            notifications: false,
            language: 'en'
          }
        }
      }
    ];

    await User.insertMany(students);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Created 1 admin user`);
    console.log(`   - Created ${createdSubjects.length} subjects`);
    console.log(`   - Created ${chapters.length} chapters`);
    console.log(`   - Created ${students.length} student users`);

    console.log('\n🔐 Default Admin Credentials:');
    console.log(`   Email: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@bioplus.com'}`);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!'}`);

    console.log('\n🎓 Sample Student Credentials:');
    students.forEach(student => {
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: Student123!`);
      console.log(`   Grade: ${student.grade}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
