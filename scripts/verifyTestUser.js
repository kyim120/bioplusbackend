const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const verifyUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sympathy-analyzer');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found`);
            process.exit(1);
        }

        user.isEmailVerified = true;
        user.status = 'active';
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save({ validateBeforeSave: false });

        console.log(`✅ User ${email} verified successfully!`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Usage: node verifyTestUser.js <email>');
    process.exit(1);
}

verifyUser(email);
