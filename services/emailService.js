const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service ready');
  }
});

// Send email verification
exports.sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: `"Bio Plus Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - Bio Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Bio Plus, ${user.firstName}!</h1>
          <p>Thank you for signing up. Please verify your email address to activate your account.</p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0;"><strong>Click the button below to verify your email:</strong></p>
          </div>

          <a href="${verificationUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Verify Email Address
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours for security reasons.
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create this account, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Bio Plus Team<br>
            Making biology learning engaging and effective
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Bio Plus Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to Bio Plus - Your Biology Learning Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Bio Plus, ${user.firstName}!</h1>
          <p>Your email has been verified and your account is now active.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What you can do:</h3>
            <ul>
              <li>Access interactive biology lessons</li>
              <li>Take practice tests and quizzes</li>
              <li>Watch educational animations</li>
              <li>Read study notes and past papers</li>
              <li>Track your learning progress</li>
              <li>Get AI-powered study recommendations</li>
            </ul>
          </div>

          <p>Get started by exploring our subjects and taking your first quiz!</p>

          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Start Learning
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, feel free to reply to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Bio Plus Team<br>
            Making biology learning engaging and effective
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Bio Plus Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request - Bio Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested a password reset for your Bio Plus account.</p>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Click the button below to reset your password:</strong></p>
          </div>

          <a href="${resetUrl}"
             style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour for security reasons.
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Bio Plus Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send account locked notification
exports.sendAccountLockedEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Bio Plus Security" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Account Temporarily Locked - Bio Plus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Account Temporarily Locked</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your Bio Plus account has been temporarily locked due to multiple failed login attempts.</p>

          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>Your account will be automatically unlocked in 2 hours.</strong></p>
          </div>

          <p>If you believe this was a mistake or if you're having trouble accessing your account, you can:</p>
          <ul>
            <li>Wait for the automatic unlock (2 hours from the last attempt)</li>
            <li>Reset your password to unlock immediately</li>
            <li>Contact support if you suspect unauthorized access</li>
          </ul>

          <a href="${process.env.FRONTEND_URL}/forgot-password"
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated security notification.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Bio Plus Security Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Account locked email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending account locked email:', error);
  }
};

// Send test completion notification
exports.sendTestCompletionEmail = async (user, testResult) => {
  try {
    const mailOptions = {
      from: `"Bio Plus Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Test Completed - ${testResult.test.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Completed Successfully!</h2>
          <p>Hello ${user.firstName},</p>
          <p>You have completed the test: <strong>${testResult.test.title}</strong></p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0;">Your Results:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Score:</strong> ${testResult.percentage}%</li>
              <li><strong>Status:</strong> ${testResult.status === 'passed' ? '✅ Passed' : '❌ Failed'}</li>
              <li><strong>Time Taken:</strong> ${Math.floor(testResult.timeTaken / 60)}m ${testResult.timeTaken % 60}s</li>
              <li><strong>Correct Answers:</strong> ${testResult.correctAnswers}/${testResult.totalQuestions}</li>
            </ul>
          </div>

          <a href="${process.env.FRONTEND_URL}/test-results/${testResult._id}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            View Detailed Results
          </a>

          <p style="color: #6b7280; font-size: 14px;">
            Keep up the great work in your biology studies!
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Bio Plus Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Test completion email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending test completion email:', error);
  }
};

module.exports = exports;
