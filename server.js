const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const toEmail = process.env.TO_EMAIL || 'defense@vhuhle.co.za';
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const smtpConfigured = smtpHost && smtpUser && smtpPass;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpConfigured ? { user: smtpUser, pass: smtpPass } : undefined,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  if (!smtpConfigured) {
    return res.status(500).json({ success: false, error: 'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.' });
  }

  const emailText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`;
  const emailHtml = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br/>')}</p>
  `;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: toEmail,
      subject: `New security consultation request from ${name}`,
      replyTo: email,
      text: emailText,
      html: emailHtml,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Contact form email error:', error);
    return res.status(500).json({ success: false, error: 'Unable to send email right now.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  if (!smtpConfigured) {
    console.warn('SMTP is not configured. Contact form will not send email until SMTP_HOST, SMTP_USER, and SMTP_PASS are set.');
  }
});
