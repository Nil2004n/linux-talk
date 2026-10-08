/**
 * Copy text to the clipboard without deprecated APIs.
 *
 * Uses the async Clipboard API only. Returns true on success, false when the
 * API is unavailable or the write is denied — callers show a fallback hint
 * instead of silently pretending the copy worked.
 */
export async function copyText(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false
  }
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
