const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc 'smtp.ethereal.email', 'mailtrap.io', 'outlook'
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Drilly System" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
