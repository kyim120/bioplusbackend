const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank', 'crypto'],
    required: function() { return this.plan !== 'free'; }
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: function() { return this.plan !== 'free'; }
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  features: {
    unlimitedTests: { type: Boolean, default: false },
    premiumNotes: { type: Boolean, default: false },
    aiTutor: { type: Boolean, default: false },
    offlineAccess: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false }
  },
  usage: {
    testsTaken: { type: Number, default: 0 },
    notesAccessed: { type: Number, default: 0 },
    aiQueries: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 } // in MB
  },
  limits: {
    maxTestsPerMonth: { type: Number, default: 10 },
    maxNotesPerMonth: { type: Number, default: 50 },
    maxAiQueriesPerMonth: { type: Number, default: 20 },
    maxStorage: { type: Number, default: 100 } // in MB
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: {
      type: String,
      enum: ['paid', 'failed', 'refunded', 'pending']
    },
    paymentDate: { type: Date, default: Date.now },
    invoiceId: String,
    transactionId: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, plan: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
