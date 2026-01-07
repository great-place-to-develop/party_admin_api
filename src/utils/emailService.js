const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email template for invite
const getInviteEmailTemplate = (invite, publicUrl, qrCodeDataUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're Invited to ${invite.eventName}</title>
      <style>
        body {
          font-family: ${invite.design.fontFamily}, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: ${invite.design.primaryColor};
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: ${invite.design.secondaryColor};
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .event-details {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .event-details h3 {
          margin-top: 0;
          color: ${invite.design.primaryColor};
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-code img {
          max-width: 200px;
          height: auto;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: ${invite.design.primaryColor};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 You're Invited! 🎉</h1>
        <h2>${invite.eventName}</h2>
      </div>
      <div class="content">
        <div class="event-details">
          <h3>Event Details</h3>
          <p><strong>📅 When:</strong> ${new Date(invite.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>📍 Where:</strong> ${invite.location}</p>
          ${invite.description ? `<p><strong>ℹ️ About:</strong> ${invite.description}</p>` : ''}
        </div>

        <div style="text-align: center;">
          <a href="${publicUrl}" class="button">View Invitation & RSVP</a>
        </div>

        <div class="qr-code">
          <p>Or scan this QR code:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code for RSVP">
        </div>

        <p style="text-align: center; margin-top: 30px;">
          We look forward to celebrating with you!
        </p>
      </div>
      <div class="footer">
        <p>This invitation was sent via Party Admin</p>
        <p>Please do not reply to this email</p>
      </div>
    </body>
    </html>
  `;
};

// Send invite email
const sendInviteEmail = async (to, invite, publicUrl, qrCodeDataUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: `You're Invited to ${invite.eventName}!`,
      html: getInviteEmailTemplate(invite, publicUrl, qrCodeDataUrl)
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Validate email address
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  sendInviteEmail,
  isValidEmail,
  transporter
};
