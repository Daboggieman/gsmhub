/**
 * Escapes special characters in a string for use in a Regular Expression.
 * Preventing Regex Injection (ReDoS) vulnerabilities.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
