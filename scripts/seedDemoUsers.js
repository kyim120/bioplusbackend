const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const demoUsers = [
  {
    email: 'student@demo.com',
    password: 'student123',
    firstName: 'Demo',
    lastName: 'Student',
    role: 'student',
    grade: '12',
    isEmailVerified: true,
    status: 'active'
  },
  {
    email: 'admin@demo.com',
    password: 'admin123',
    firstName: 'Demo',
    lastName: 'Admin',
    role: 'admin',
    isEmailVerified: true,
    status: 'active'
  },
  {
    email: 'owner@demo.com',
    password: 'owner123',
    firstName: 'Demo',
    lastName: 'Owner',
    role: 'owner',
    isEmailVerified: true,
    status: 'active'
  }
];

async function seedDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Check if demo users already exist and remove them
    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ email: demoUser.email });
      if (existingUser) {
        await User.deleteOne({ email: demoUser.email });
        console.log(`Removed existing user: ${demoUser.email}`);
      }
    }

    // Create demo users
    for (const demoUser of demoUsers) {
      const user = new User({
        email: demoUser.email,
        password: demoUser.password, // plain text, hash on save
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        grade: demoUser.grade,
        isEmailVerified: demoUser.isEmailVerified,
        status: demoUser.status,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
        isActive: true
      });
      await user.save();
      console.log(`✅ Created ${demoUser.role}: ${demoUser.email}`);
    }

    console.log('\n🎉 Demo users created successfully!');
    console.log('\nDemo Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Student: student@demo.com / student123');
    console.log('Admin:   admin@demo.com / admin123');
    console.log('Owner:   owner@demo.com / owner123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  }
}

seedDemoUsers();
