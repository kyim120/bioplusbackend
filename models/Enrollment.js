const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    currentChapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    completedChapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
    notes: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}, {
    timestamps: true
});

// Compound index to ensure a student can only enroll once per book
enrollmentSchema.index({ student: 1, book: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ book: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
