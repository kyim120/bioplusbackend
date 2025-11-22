const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Book = require('../models/Book');
require('dotenv').config();

const seedContent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sympathy-analyzer');
        console.log('MongoDB Connected');

        // Clear existing content
        await Book.deleteMany({});
        await Chapter.deleteMany({});
        await Subject.deleteMany({});
        console.log('Cleared existing content');

        // Create Subjects
        const subjects = await Subject.create([
            {
                name: 'Biology',
                code: 'BIO9',
                description: 'Study of living organisms and their vital processes',
                grade: '9',
                order: 1,
                icon: '🧬',
                color: '#10b981',
                isActive: true
            },
            {
                name: 'Biology',
                code: 'BIO10',
                description: 'Advanced study of living organisms',
                grade: '10',
                order: 1,
                icon: '🧬',
                color: '#10b981',
                isActive: true
            },
            {
                name: 'Chemistry',
                code: 'CHEM9',
                description: 'Study of matter and its properties',
                grade: '9',
                order: 2,
                icon: '⚗️',
                color: '#3b82f6',
                isActive: true
            },
            {
                name: 'Physics',
                code: 'PHY10',
                description: 'Study of matter, energy, and their interactions',
                grade: '10',
                order: 3,
                icon: '⚛️',
                color: '#8b5cf6',
                isActive: true
            }
        ]);

        console.log(`✅ Created ${subjects.length} subjects`);

        // Create Chapters for Biology Grade 9
        const bio9Subject = subjects.find(s => s.code === 'BIO9');
        const bio9Chapters = await Chapter.create([
            {
                subject: bio9Subject._id,
                name: 'Introduction to Biology',
                grade: '9',
                chapterNumber: 1,
                description: 'Basic concepts of biology and living organisms',
                content: 'This chapter introduces the fundamental concepts of biology...',
                learningObjectives: [
                    'Understand what biology is',
                    'Learn about characteristics of living things',
                    'Explore the scientific method'
                ],
                estimatedTime: 120,
                difficulty: 'easy',
                isActive: true
            },
            {
                subject: bio9Subject._id,
                name: 'Cell Structure',
                grade: '9',
                chapterNumber: 2,
                description: 'Understanding the basic unit of life',
                content: 'Cells are the basic building blocks of all living things...',
                learningObjectives: [
                    'Identify cell organelles',
                    'Understand cell membrane function',
                    'Compare plant and animal cells'
                ],
                estimatedTime: 180,
                difficulty: 'medium',
                isActive: true
            },
            {
                subject: bio9Subject._id,
                name: 'Cell Division',
                grade: '9',
                chapterNumber: 3,
                description: 'How cells reproduce',
                content: 'Cell division is the process by which cells reproduce...',
                learningObjectives: [
                    'Understand mitosis',
                    'Learn about meiosis',
                    'Explore cell cycle'
                ],
                estimatedTime: 150,
                difficulty: 'medium',
                isActive: true
            }
        ]);

        console.log(`✅ Created ${bio9Chapters.length} chapters for Biology Grade 9`);

        // Create Chapters for Biology Grade 10
        const bio10Subject = subjects.find(s => s.code === 'BIO10');
        const bio10Chapters = await Chapter.create([
            {
                subject: bio10Subject._id,
                name: 'Genetics and Heredity',
                grade: '10',
                chapterNumber: 1,
                description: 'Understanding inheritance and genes',
                content: 'Genetics is the study of heredity and variation...',
                learningObjectives: [
                    'Understand Mendelian genetics',
                    'Learn about DNA structure',
                    'Explore genetic disorders'
                ],
                estimatedTime: 200,
                difficulty: 'hard',
                isActive: true
            },
            {
                subject: bio10Subject._id,
                name: 'Evolution',
                grade: '10',
                chapterNumber: 2,
                description: 'Theory of evolution and natural selection',
                content: 'Evolution is the change in heritable characteristics...',
                learningObjectives: [
                    'Understand natural selection',
                    'Learn about adaptation',
                    'Explore evidence for evolution'
                ],
                estimatedTime: 180,
                difficulty: 'hard',
                isActive: true
            }
        ]);

        console.log(`✅ Created ${bio10Chapters.length} chapters for Biology Grade 10`);

        // Get admin user for createdBy field
        const User = require('../models/User');
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            throw new Error('Admin user not found. Please run seed-demo first.');
        }

        // Create Books
        const books = await Book.create([
            {
                title: 'Introduction to Biology',
                author: 'Dr. Sarah Johnson, Prof. Michael Chen',
                description: 'A comprehensive introduction to biology for Grade 9 students covering cells, organisms, and basic life processes.',
                subject: bio9Subject._id,
                grade: '9',
                chapters: bio9Chapters.map(c => c._id),
                publisher: 'Bio Plus Education',
                publicationYear: 2024,
                edition: '1st Edition',
                isbn: '978-1-234567-89-0',
                language: 'English',
                pages: 250,
                thumbnailUrl: '/images/books/bio-9-cover.jpg',
                bookType: 'textbook',
                tags: ['biology', 'cells', 'life science', 'grade 9'],
                isActive: true,
                isFree: true,
                createdBy: adminUser._id
            },
            {
                title: 'Advanced Biology',
                author: 'Dr. Emily Rodriguez, Prof. David Kim',
                description: 'Advanced biology concepts for Grade 10 including genetics, evolution, and ecology.',
                subject: bio10Subject._id,
                grade: '10',
                chapters: bio10Chapters.map(c => c._id),
                publisher: 'Bio Plus Education',
                publicationYear: 2024,
                edition: '1st Edition',
                isbn: '978-1-234567-90-6',
                language: 'English',
                pages: 320,
                thumbnailUrl: '/images/books/bio-10-cover.jpg',
                bookType: 'textbook',
                tags: ['biology', 'genetics', 'evolution', 'grade 10'],
                isActive: true,
                isFree: true,
                createdBy: adminUser._id
            },
            {
                title: 'Chemistry Fundamentals',
                author: 'Dr. Robert Williams',
                description: 'Essential chemistry concepts for Grade 9 students including atoms, molecules, and chemical reactions.',
                subject: subjects.find(s => s.code === 'CHEM9')._id,
                grade: '9',
                chapters: [],
                publisher: 'Bio Plus Education',
                publicationYear: 2024,
                edition: '1st Edition',
                isbn: '978-1-234567-91-3',
                language: 'English',
                pages: 280,
                thumbnailUrl: '/images/books/chem-9-cover.jpg',
                bookType: 'textbook',
                tags: ['chemistry', 'atoms', 'reactions', 'grade 9'],
                isActive: true,
                isFree: true,
                createdBy: adminUser._id
            },
            {
                title: 'Physics Principles',
                author: 'Prof. Lisa Anderson',
                description: 'Core physics principles for Grade 10 covering mechanics, energy, and waves.',
                subject: subjects.find(s => s.code === 'PHY10')._id,
                grade: '10',
                chapters: [],
                publisher: 'Bio Plus Education',
                publicationYear: 2024,
                edition: '1st Edition',
                isbn: '978-1-234567-92-0',
                language: 'English',
                pages: 300,
                thumbnailUrl: '/images/books/physics-10-cover.jpg',
                bookType: 'textbook',
                tags: ['physics', 'mechanics', 'energy', 'grade 10'],
                isActive: true,
                isFree: true,
                createdBy: adminUser._id
            }
        ]);

        console.log(`✅ Created ${books.length} books`);

        // Update subjects with chapter references
        await Subject.findByIdAndUpdate(bio9Subject._id, {
            chapters: bio9Chapters.map(c => c._id)
        });
        await Subject.findByIdAndUpdate(bio10Subject._id, {
            chapters: bio10Chapters.map(c => c._id)
        });

        console.log('\n📚 Content Seeding Complete!');
        console.log(`   Subjects: ${subjects.length}`);
        console.log(`   Chapters: ${bio9Chapters.length + bio10Chapters.length}`);
        console.log(`   Books: ${books.length}`);
        console.log('\n✅ All content has been seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding content:', error);
        process.exit(1);
    }
};

seedContent();
