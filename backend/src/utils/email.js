import nodemailer from 'nodemailer'
import { logger } from './logger.js'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email, firstName, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Emperor FX <noreply@emperorfx.com>',
    to: email,
    subject: '🏛️ Verify Your Emperor FX Account',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0a0a0a; color:#fff; font-family: Arial, sans-serif; margin:0; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#111; border:1px solid #d4af37; border-radius:12px; padding:40px;">
          <div style="text-align:center; margin-bottom:30px;">
            <h1 style="color:#d4af37; font-size:28px; margin:0;">⚜️ EMPEROR FX</h1>
            <p style="color:#888; margin-top:5px;">Secure Your Empire</p>
          </div>
          <h2 style="color:#fff;">Welcome, ${firstName}!</h2>
          <p style="color:#ccc; line-height:1.6;">
            Thank you for joining Emperor FX. Please verify your email address to activate your account
            and access the platform.
          </p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${verifyUrl}"
               style="background: linear-gradient(135deg, #d4af37, #b8860b); color:#000;
                      padding:14px 32px; border-radius:8px; text-decoration:none;
                      font-weight:bold; font-size:16px; display:inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="color:#666; font-size:12px;">
            This link expires in 24 hours. If you didn't create an account, ignore this email.
          </p>
          <hr style="border-color:#333; margin:20px 0;">
          <p style="color:#666; font-size:11px; text-align:center;">
            © ${new Date().getFullYear()} Emperor FX. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  })

  logger.info(`Verification email sent to ${email}`)
}

/**
 * Send trade notification email
 */
export async function sendTradeNotification(email, firstName, trade) {
  const transporter = createTransporter()
  const { side, symbol, quantity, price, value } = trade

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `✅ Trade Executed: ${side.toUpperCase()} ${quantity} ${symbol}`,
    html: `
      <div style="background:#0a0a0a; color:#fff; font-family: Arial; padding:20px;">
        <h2 style="color:#d4af37;">Trade Confirmation</h2>
        <p>Hi ${firstName}, your trade has been executed:</p>
        <table style="border-collapse:collapse; width:100%;">
          <tr><td style="color:#888; padding:8px;">Type</td><td style="color:#${side === 'buy' ? '00c853' : 'ff1744'}; padding:8px;">${side.toUpperCase()}</td></tr>
          <tr><td style="color:#888; padding:8px;">Symbol</td><td style="padding:8px;">${symbol}</td></tr>
          <tr><td style="color:#888; padding:8px;">Quantity</td><td style="padding:8px;">${quantity}</td></tr>
          <tr><td style="color:#888; padding:8px;">Price</td><td style="padding:8px;">$${price.toLocaleString()}</td></tr>
          <tr><td style="color:#888; padding:8px;">Total</td><td style="padding:8px;">$${value.toLocaleString()}</td></tr>
        </table>
      </div>
    `,
  })
}
