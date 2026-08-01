import nodemailer from 'nodemailer'

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (transporter) return transporter

  const user = process.env.GMAIL_SMTP_USER
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD

  if (!user || !pass) {
    throw new Error(
      'GMAIL_SMTP_USER / GMAIL_SMTP_APP_PASSWORD are not set. Add them to your environment ' +
        '(GMAIL_SMTP_APP_PASSWORD must be a Gmail App Password, not your normal Gmail password).',
    )
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  return transporter
}

export async function sendOtpEmail(to: string, otp: string, purpose: 'signup' | 'reset') {
  const subject =
    purpose === 'signup' ? 'Your CivicMind verification code' : 'Your CivicMind password reset code'

  const heading =
    purpose === 'signup' ? 'Verify your email' : 'Reset your password'

  const bodyLine =
    purpose === 'signup'
      ? 'Use the code below to verify your email and activate your CivicMind account.'
      : 'Use the code below to reset your CivicMind password.'

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f172a;">${heading}</h2>
      <p style="color: #334155; font-size: 14px;">${bodyLine}</p>
      <div style="background: #0f172a; color: #fbbf24; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 12px; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `

  await getTransporter().sendMail({
    from: `"CivicMind" <${process.env.GMAIL_SMTP_USER}>`,
    to,
    subject,
    html,
  })
}
