import nodemailer from 'nodemailer';

/**
 * Escapes HTML characters to prevent XSS in email templates.
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Send the generated PDF report via email to the applicant.
 *
 * @param {string} to - Recipient email address
 * @param {string} applicantName - Name of the contact person
 * @param {Buffer} pdfBuffer - The PDF report as a buffer
 * @returns {Promise<object>} - Nodemailer send result
 */
/**
 * Send the generated PDF report via email to the Administrator.
 *
 * @param {string} to - Recipient administrator email address
 * @param {Object} reportData - The submission data
 * @param {Buffer} pdfBuffer - The PDF report as a buffer
 * @returns {Promise<object>} - Nodemailer send result
 */
export async function sendReportEmail(to, reportData, pdfBuffer) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const applicantName = escapeHtml(reportData.contactPersonName || 'Applicant');
  const orgName = escapeHtml(reportData.organizationName || 'N/A');
  const productName = escapeHtml(reportData.productName || 'N/A');
  const submitterEmail = escapeHtml(reportData.contactEmail || reportData.email || 'N/A');

  const mailOptions = {
    from: process.env.SMTP_FROM || '"CERT-In & ICAN Report System" <noreply@certin-ican.in>',
    to,
    subject: `New Product Submission: ${productName} (${orgName})`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a365d; margin: 0;">CERT-In & ICAN</h2>
          <p style="color: #666; font-size: 14px;">Indigenous Cybersecurity Products Initiative</p>
        </div>
        <hr style="border: none; border-top: 2px solid #f97316; margin: 20px 0;" />
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Hello Admin,
        </p>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          A new product submission has been received for the <strong>CERT-In & ICAN Joint Call for Information</strong>.
        </p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #1a365d; font-size: 14px;">Submission Details:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; font-weight: 600; color: #64748b; width: 40%;">Organization:</td>
              <td style="padding: 4px 0; color: #334155;">${orgName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Product Name:</td>
              <td style="padding: 4px 0; color: #334155;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Contact Person:</td>
              <td style="padding: 4px 0; color: #334155;">${applicantName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Email Address:</td>
              <td style="padding: 4px 0; color: #334155;">${submitterEmail}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1a365d; font-size: 14px;">
            📎 <strong>Attachment:</strong> The complete 20-field Information Report PDF is attached to this email.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 11px; text-align: center;">
          This is an automated notification from the CERT-In & ICAN Indigenous Cybersecurity Products Webhook.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `CERT-In_ICAN_Report_${orgName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}

/**
 * Send a welcome confirmation email for new registrations.
 *
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} token - Verification token
 */
export async function sendWelcomeEmail(to, name, token) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Registry Portal" <noreply@certin-ican.in>',
    to,
    subject: 'Verify your email - Registry Portal',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome, ${escapeHtml(name)}!</h2>
        <p>Your account has been successfully created.</p>
        <p>Please verify your email address to continue by clicking the link below:</p>
        <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

/**
 * Send an already registered notification.
 *
 * @param {string} to - Recipient email address
 * @param {string} name - User's name (if available)
 */
export async function sendAlreadyRegisteredEmail(to, name) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Registry Portal" <noreply@certin-ican.in>',
    to,
    subject: 'Registration Attempt on Registry Portal',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello ${name ? escapeHtml(name) : ''},</h2>
        <p>We noticed a recent registration attempt using this email address.</p>
        <p>This email is already registered in our system. If this was you, please log in instead.</p>
        <p>If you forgot your password, please use the password reset feature.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending already registered email:', error);
  }
}
