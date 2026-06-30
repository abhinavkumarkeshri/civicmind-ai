/**
 * Admin Email Allowlist
 * Only email addresses in this list can register, authenticate, and access the Admin Portal.
 * Add additional authorized admin emails here without changing application logic.
 */

// Server-side allowlist - stored in environment or hardcoded
export const ADMIN_ALLOWLIST = [
  'abhinavkumarkeshri27@gmail.com',
  'abhinavkrk888@gmail.com',
]

/**
 * Validate if an email is authorized to create an admin account
 */
export function isAuthorizedAdminEmail(email: string): boolean {
  return getAuthorizedAdminEmails().includes(email.toLowerCase())
}

/**
 * Get authorized admin emails from environment or use hardcoded list
 */
export function getAuthorizedAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS
  if (envEmails) {
    return envEmails.split(',').map((e) => e.trim().toLowerCase())
  }
  return ADMIN_ALLOWLIST.map((e) => e.toLowerCase())
}

/**
 * Check if user can access admin portal
 */
export function canAccessAdminPortal(email: string | null | undefined): boolean {
  if (!email) return false
  return getAuthorizedAdminEmails().includes(email.toLowerCase())
}
