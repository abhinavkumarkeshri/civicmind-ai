import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const OTP_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5

export type OtpPurpose = 'signup' | 'reset'

function generateSixDigitOtp(): string {
  // crypto.randomInt is cryptographically strong, unlike Math.random()
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function hashOtp(otp: string, email: string): string {
  return crypto.createHash('sha256').update(`${email.toLowerCase()}:${otp}`).digest('hex')
}

/**
 * Creates a new OTP for the given email + purpose, stores its hash (never
 * the plaintext code) with a 10-minute expiry, and returns the plaintext
 * code so the caller can email it.
 */
export async function createOtp(email: string, purpose: OtpPurpose): Promise<string> {
  const otp = generateSixDigitOtp()
  const otpHash = hashOtp(otp, email)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()

  const supabase = createAdminClient()
  // One active OTP per email+purpose — overwrite any previous one.
  const { error } = await supabase.from('otp_verifications').upsert(
    {
      email: email.toLowerCase(),
      purpose,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      verified: false,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'email,purpose' },
  )

  if (error) throw new Error(`Failed to create OTP: ${error.message}`)
  return otp
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'too_many_attempts' | 'incorrect' }

/**
 * Verifies a submitted OTP. Increments the attempt counter on every
 * mismatch and locks the code out after MAX_ATTEMPTS to prevent brute force.
 * On success, marks the row verified (it stays around briefly for the
 * reset-password step to reference, then gets deleted by the caller).
 */
export async function verifyOtp(email: string, purpose: OtpPurpose, submittedOtp: string): Promise<VerifyOtpResult> {
  const supabase = createAdminClient()
  const { data: row } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('purpose', purpose)
    .single()

  if (!row) return { ok: false, reason: 'not_found' }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: 'expired' }
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' }
  }

  const submittedHash = hashOtp(submittedOtp, email)
  if (submittedHash !== row.otp_hash) {
    await supabase
      .from('otp_verifications')
      .update({ attempts: row.attempts + 1 })
      .eq('email', email.toLowerCase())
      .eq('purpose', purpose)
    return { ok: false, reason: 'incorrect' }
  }

  await supabase
    .from('otp_verifications')
    .update({ verified: true })
    .eq('email', email.toLowerCase())
    .eq('purpose', purpose)

  return { ok: true }
}

export async function consumeOtp(email: string, purpose: OtpPurpose) {
  const supabase = createAdminClient()
  await supabase.from('otp_verifications').delete().eq('email', email.toLowerCase()).eq('purpose', purpose)
}
