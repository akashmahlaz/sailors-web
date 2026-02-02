import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SupportRequestEmailData {
  title: string
  description: string
  category: string
  isAnonymous: boolean
  submitterName?: string
  submitterEmail?: string
  submitterId?: string
  proofs: Array<{
    url: string
    publicId: string
    resourceType: string
    format: string
    name?: string
  }>
  requestId: string
  createdAt: Date
}

const getEmailConfig = (): EmailConfig => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com"
  const port = parseInt(process.env.EMAIL_PORT || "587")
  const secure = process.env.EMAIL_SECURE === "true" || port === 465
  const user = process.env.EMAIL_USER || ""
  const pass = process.env.EMAIL_PASS || ""

  if (!user || !pass) {
    console.warn("Email credentials not configured. Emails will not be sent.")
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  }
}

const createTransporter = () => {
  const config = getEmailConfig()
  return nodemailer.createTransport(config)
}

export const sendSupportRequestEmails = async (data: SupportRequestEmailData) => {
  const transporter = createTransporter()

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email not configured, skipping email send for support request:", data.requestId)
    return
  }

  const adminEmails = [
    "dileep_14june@yahoo.com",
    "cetusleader2009@gmail.com",
    "akashdalla407@gmail.com"
  ]

  const formatProofsList = (proofs: SupportRequestEmailData["proofs"]) => {
    if (!proofs || proofs.length === 0) {
      return "No supporting evidence attached."
    }

    return proofs
      .map((proof, index) => {
        const mediaType = proof.resourceType === "image" ? "Image" :
                          proof.resourceType === "video" ? "Video" : "File"
        return `${index + 1}. ${mediaType}: ${proof.name || proof.publicId}\n   URL: ${proof.url}`
      })
      .join("\n\n")
  }

  const emailSubject = `New Support Request: ${data.title}`

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Support Request - Sailors Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: #f5f7fa;
        }
        .email-container {
          max-width: 680px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 40px 50px;
          border-radius: 8px 8px 0 0;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .logo-icon {
          font-size: 36px;
        }
        .header-subtitle {
          font-size: 14px;
          opacity: 0.95;
          font-weight: 300;
          position: relative;
          z-index: 1;
        }
        .content {
          padding: 45px 50px;
          background: #ffffff;
        }
        .alert-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
          padding: 18px 20px;
          margin-bottom: 30px;
          border-radius: 6px;
          font-weight: 500;
          color: #92400e;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
          margin-bottom: 30px;
        }
        .info-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }
        .info-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }
        .info-value {
          font-size: 16px;
          color: #1a1a1a;
          font-weight: 500;
        }
        .info-value-large {
          font-size: 18px;
          font-weight: 600;
          color: #1e3a8a;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .badge.anonymous {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        .description-box {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 22px;
          margin-top: 20px;
          line-height: 1.8;
          font-size: 15px;
          color: #374151;
        }
        .proofs-section {
          margin-top: 30px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 25px;
        }
        .proofs-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .proof-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 12px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .proof-item:last-child {
          margin-bottom: 0;
        }
        .proof-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          flex-shrink: 0;
        }
        .proof-details {
          flex: 1;
        }
        .proof-name {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .proof-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 13px;
          word-break: break-all;
        }
        .footer {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 30px 50px;
          border-radius: 0 0 8px 8px;
          margin-top: 0;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-info {
          flex: 1;
        }
        .footer-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 5px;
          font-size: 15px;
        }
        .footer-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }
        .footer-meta {
          text-align: right;
          font-size: 13px;
          color: #6b7280;
        }
        .timestamp {
          font-weight: 600;
          color: #3b82f6;
          font-size: 14px;
        }
        .priority-indicator {
          display: inline-block;
          padding: 4px 12px;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 10px;
        }
        @media (max-width: 600px) {
          .header, .content, .footer {
            padding: 30px 25px;
          }
          .footer-content {
            flex-direction: column;
            text-align: left;
          }
          .footer-meta {
            text-align: left;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🚢</span>
            <span>Sailors Platform</span>
          </div>
          <div class="header-subtitle">Confidential Support Request Management System</div>
        </div>

        <div class="content">
          <div class="alert-box">
            ⚠️ New support request requires your immediate attention
          </div>

          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Request ID</span>
              <div class="info-value-large">#${data.requestId}</div>
            </div>

            <div class="info-card">
              <span class="info-label">Title</span>
              <div class="info-value-large">${data.title}</div>
            </div>

            <div class="info-card">
              <span class="info-label">Category</span>
              <span class="badge">${data.category}</span>
            </div>

            <div class="info-card">
              <span class="info-label">Submitted By</span>
              <div class="info-value">
                ${
                  data.isAnonymous
                    ? '<span class="badge anonymous">Anonymous Submission</span>'
                    : `${data.submitterName || "N/A"}<br><span style="font-size: 13px; color: #6b7280;">${data.submitterEmail || "N/A"}</span>`
                }
              </div>
            </div>
          </div>

          <div class="description-box">
            <span class="info-label">Detailed Description</span>
            <div style="margin-top: 12px;">${data.description}</div>
          </div>

          <div class="proofs-section">
            <div class="proofs-title">
              📎 Supporting Evidence (${data.proofs.length} ${data.proofs.length === 1 ? 'item' : 'items'})
            </div>
            ${data.proofs && data.proofs.length > 0 ? data.proofs.map((proof, index) => {
              const mediaType = proof.resourceType === "image" ? "🖼️" :
                                proof.resourceType === "video" ? "🎥" : "📄";
              return `
                <div class="proof-item">
                  <div class="proof-icon">${mediaType}</div>
                  <div class="proof-details">
                    <div class="proof-name">${proof.name || proof.publicId}</div>
                    <a href="${proof.url}" class="proof-link">${proof.url}</a>
                  </div>
                </div>
              `;
            }).join('') : '<div style="color: #6b7280; font-style: italic;">No supporting evidence attached</div>'}
          </div>
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-info">
              <div class="footer-title">Action Required</div>
              <div class="footer-text">
                Please review this support request in the admin dashboard and take appropriate action.
                Ensure confidentiality and proper handling of all sensitive information.
              </div>
            </div>
            <div class="footer-meta">
              <div class="footer-title">Submitted</div>
              <div class="timestamp">${data.createdAt.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const submitterEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Request Confirmation - Sailors Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: #f5f7fa;
        }
        .email-container {
          max-width: 680px;
          margin: 0 auto;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 40px 50px;
          border-radius: 8px 8px 0 0;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }
        .logo-icon {
          font-size: 36px;
        }
        .header-subtitle {
          font-size: 14px;
          opacity: 0.95;
          font-weight: 300;
          position: relative;
          z-index: 1;
        }
        .content {
          padding: 45px 50px;
          background: #ffffff;
        }
        .success-box {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-left: 4px solid #10b981;
          padding: 20px 22px;
          margin-bottom: 30px;
          border-radius: 6px;
        }
        .success-title {
          font-size: 18px;
          font-weight: 700;
          color: #065f46;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .success-text {
          color: #047857;
          font-size: 15px;
          line-height: 1.7;
        }
        .info-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 18px;
          display: block;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .info-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;
        }
        .info-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 6px;
          display: block;
        }
        .info-value {
          font-size: 16px;
          color: #1a1a1a;
          font-weight: 500;
        }
        .info-value-large {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
          letter-spacing: 0.5px;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .description-box {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-top: 15px;
          line-height: 1.8;
          font-size: 15px;
          color: #374151;
        }
        .steps-section {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 25px;
          margin-top: 25px;
        }
        .steps-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e40af;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          padding: 10px 0 10px 30px;
          position: relative;
          color: #1e40af;
          font-size: 14px;
        }
        .steps-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
          font-size: 16px;
        }
        .footer {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 30px 50px;
          border-radius: 0 0 8px 8px;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-info {
          flex: 1;
        }
        .footer-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 5px;
          font-size: 15px;
        }
        .footer-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
        }
        .footer-meta {
          text-align: right;
          font-size: 13px;
          color: #6b7280;
        }
        .request-id-box {
          background: white;
          border: 2px dashed #10b981;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          margin: 20px 0;
        }
        .request-id-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .request-id-value {
          font-size: 22px;
          font-weight: 700;
          color: #059669;
          letter-spacing: 1px;
          font-family: 'Courier New', monospace;
        }
        @media (max-width: 600px) {
          .header, .content, .footer {
            padding: 30px 25px;
          }
          .footer-content {
            flex-direction: column;
            text-align: left;
          }
          .footer-meta {
            text-align: left;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">🚢</span>
            <span>Sailors Platform</span>
          </div>
          <div class="header-subtitle">Your Confidential Support Channel</div>
        </div>

        <div class="content">
          <div class="success-box">
            <div class="success-title">
              ✓ Support Request Successfully Submitted
            </div>
            <div class="success-text">
              Thank you for reaching out. Your support request has been received and a ship's officer will review it promptly. We take all concerns seriously and will handle your matter with the utmost confidentiality and care.
            </div>
          </div>

          <div class="request-id-box">
            <div class="request-id-label">Your Request Reference ID</div>
            <div class="request-id-value">#${data.requestId}</div>
          </div>

          <div class="info-section">
            <span class="section-title">Request Details</span>
            <div class="info-grid">
              <div class="info-card">
                <span class="info-label">Title</span>
                <div class="info-value-large">${data.title}</div>
              </div>

              <div class="info-card">
                <span class="info-label">Category</span>
                <span class="badge">${data.category}</span>
              </div>
            </div>

            <div class="description-box">
              <span class="info-label">Your Description</span>
              <div style="margin-top: 10px;">${data.description}</div>
            </div>
          </div>

          <div class="steps-section">
            <div class="steps-title">What Happens Next?</div>
            <ul class="steps-list">
              <li>Your request has been logged in our secure system</li>
              <li>A designated ship's officer will review your submission</li>
              <li>We will investigate the matter thoroughly and confidentially</li>
              <li>You will receive updates as appropriate (unless submitted anonymously)</li>
              <li>Appropriate action will be taken based on our findings</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-info">
              <div class="footer-title">Need to Reference This Request?</div>
              <div class="footer-text">
                Please save your Request ID: <strong>#${data.requestId}</strong> for any future correspondence.
              </div>
            </div>
            <div class="footer-meta">
              <div class="footer-title">Submitted</div>
              <div style="font-weight: 600; color: #059669; font-size: 14px;">
                ${data.createdAt.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const adminEmailText = `
New Support Request Received

Request ID: ${data.requestId}

Title: ${data.title}
Category: ${data.category}

Submitted By: ${data.isAnonymous ? "Anonymous" : `${data.submitterName || "N/A"} (${data.submitterEmail || "N/A"})`}

Description:
${data.description}

Supporting Evidence:
${formatProofsList(data.proofs)}

Submitted: ${data.createdAt.toLocaleString()}

Please review this support request in the admin dashboard.
  `.trim()

  const submitterEmailText = `
Support Request Received

Thank you for submitting a support request. We have received your concern and a ship's officer will review it shortly.

Your Request ID: ${data.requestId}

Title: ${data.title}
Category: ${data.category}

Description:
${data.description}

Submitted: ${data.createdAt.toLocaleString()}

If you have any questions, please reference your Request ID: ${data.requestId}
  `.trim()

  const sendEmails = []

  sendEmails.push(
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmails,
      subject: emailSubject,
      text: adminEmailText,
      html: adminEmailHtml,
    })
  )

  if (!data.isAnonymous && data.submitterEmail) {
    sendEmails.push(
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data.submitterEmail,
        subject: `Your Support Request: ${data.title}`,
        text: submitterEmailText,
        html: submitterEmailHtml,
      })
    )
  }

  try {
    await Promise.all(sendEmails)
    console.log("Support request emails sent successfully for request:", data.requestId)
  } catch (error) {
    console.error("Error sending support request emails:", error)
    throw error
  }
}
