const nodemailer = require('nodemailer');
const { formatDate } = require('./helpers');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const templates = {
  attendanceAlert: (studentName, courseName, attendancePercentage) => ({
    subject: 'Low Attendance Alert',
    html: `
      <h2>Low Attendance Alert</h2>
      <p>Dear ${studentName},</p>
      <p>This is to inform you that your attendance in ${courseName} has fallen below 75%.</p>
      <p>Current attendance percentage: ${attendancePercentage}%</p>
      <p>Please ensure regular attendance to maintain the required attendance percentage.</p>
      <p>Best regards,<br>College Administration</p>
    `
  }),
  
  courseEnrollment: (studentName, courseName, teacherName) => ({
    subject: 'Course Enrollment Confirmation',
    html: `
      <h2>Course Enrollment Confirmation</h2>
      <p>Dear ${studentName},</p>
      <p>You have been successfully enrolled in ${courseName}.</p>
      <p>Course Instructor: ${teacherName}</p>
      <p>Please check your dashboard for course details and schedule.</p>
      <p>Best regards,<br>College Administration</p>
    `
  }),

  feedbackSubmission: (studentName, courseName) => ({
    subject: 'Feedback Submission Confirmation',
    html: `
      <h2>Feedback Submission Confirmation</h2>
      <p>Dear ${studentName},</p>
      <p>Thank you for submitting your feedback for ${courseName}.</p>
      <p>Your feedback has been received and will be reviewed by the administration.</p>
      <p>Best regards,<br>College Administration</p>
    `
  }),

  accountCreation: (userName, role) => ({
    subject: 'Account Created Successfully',
    html: `
      <h2>Account Created Successfully</h2>
      <p>Dear ${userName},</p>
      <p>Your account has been created successfully with the role of ${role}.</p>
      <p>You can now log in to the system using your credentials.</p>
      <p>Best regards,<br>College Administration</p>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = templates[template](...data);
    
    const mailOptions = {
      from: `"College Attendance System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Verify SMTP connection
const verifySMTPConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection verification failed:', error);
    return false;
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, template, data) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template, data);
    results.push({ recipient, ...result });
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifySMTPConnection,
  templates
}; 