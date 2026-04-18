/**
 * Utility to generate a clean, URL-friendly username from a display name or email.
 */
export const generateUsername = (displayName?: string | null, email?: string | null): string => {
  // 1. Try display name first
  let base = displayName || '';

  // 2. Fallback to email prefix if display name is empty
  if (!base && email) {
    base = email.split('@')[0];
  }

  // 3. Normalize: lowercase, remove special characters except underscores/dots, replace spaces with underscores
  let username = base
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.]/g, '');

  // 4. Final safety check: if still empty, use a default
  if (!username) {
    username = `user_${Math.random().toString(36).substring(2, 7)}`;
  }

  return username;
};

/**
 * Sanitizes an existing username by removing the '@' prefix and trimming.
 */
export const sanitizeUsername = (username?: string | null): string => {
  return (username || '').replace(/^@/, '').trim();
};
