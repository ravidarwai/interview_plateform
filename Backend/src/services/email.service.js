const nodemailer = require("nodemailer")

// Read SMTP configurations from environment variables
const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || "AI Interview Platform <no-reply@ai-interview.com>"

let transporter = null

if (smtpHost && smtpUser && smtpPass) {
    try {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort) || 587,
            secure: (smtpPort === "465"), // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        })
        console.log("Nodemailer SMTP Transporter initialized successfully.")
    } catch (error) {
        console.error("Failed to initialize SMTP Transporter:", error)
    }
} else {
    console.log("No SMTP credentials found in environment variables. Email service will run in Console/Mock mode.")
}

/**
 * Sends a password reset email to the specified address.
 * Falls back to console log if SMTP is not configured.
 * 
 * @param {string} toEmail - Recipient's email address
 * @param {string} resetLink - The password reset URL
 * @returns {Promise<{ sent: boolean, method: 'smtp' | 'console', link?: string }>}
 */
async function sendResetEmail(toEmail, resetLink) {
    const mailOptions = {
        from: smtpFrom,
        to: toEmail,
        subject: "Password Reset Request - AI Interview Platform",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1034d; border-radius: 8px; background-color: #ffffff; color: #333333;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #e1034d; margin: 0;">AI Interview Platform</h2>
                </div>
                <p>Hello,</p>
                <p>We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #e1034d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 0.9em; color: #666666;">If the button above does not work, copy and paste the following link into your web browser:</p>
                <p style="word-break: break-all; font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                    <a href="${resetLink}" style="color: #e1034d;">${resetLink}</a>
                </p>
                <p style="font-size: 0.8em; color: #999999; margin-top: 30px; border-top: 1px solid #dddddd; padding-top: 15px;">
                    This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.
                </p>
            </div>
        `
    }

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions)
            console.log(`Password reset email successfully sent to: ${toEmail} (via SMTP)`)
            return { sent: true, method: "smtp" }
        } catch (error) {
            console.error(`Failed to send email via SMTP to ${toEmail}:`, error)
            // Fall back to console log on SMTP failure
        }
    }

    // Console Logging Mode (Fallback)
    console.log("\n==================================================")
    console.log("📧 MOCK EMAIL SENT")
    console.log(`To:      ${toEmail}`)
    console.log(`Subject: ${mailOptions.subject}`)
    console.log(`Link:    ${resetLink}`)
    console.log("==================================================\n")

    return { sent: true, method: "console", link: resetLink }
}

module.exports = {
    sendResetEmail
}
