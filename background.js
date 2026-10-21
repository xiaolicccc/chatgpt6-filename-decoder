"use strict";

/**
 * Return a safe, decoded leaf filename, or null if no correction is needed.
 * The original DownloadItem.filename can be an absolute OS path; Chrome's
 * filename suggestion must be relative to the default downloads folder.
 */
function decodedUnicodeFilename(path) {
  if (typeof path !== "string" || path.length === 0) return null;
  const leaf = path.split(/[\\/]/).pop();
  if (!leaf || !/%[0-9a-f]{2}/i.test(leaf)) return null;

  let result;
  try {
    result = decodeURIComponent(leaf);
  } catch (_) {
    // Malformed percent escapes / invalid UTF-8: leave download unchanged.
    return null;
  }

  // Only fix clearly percent-encoded non-ASCII names. Ordinary names, even
  // ones that contain e.g. %20, are left unchanged.
  if (result === leaf || !/[^\x00-\x7f]/.test(result)) return null;

  // Never introduce directory traversal, separators, control characters,
  // or Windows-invalid filename punctuation through decoding.
  if (result === "." || result === "..") return null;
  if (/[\\/\x00-\x1f\x7f<>:"|?*]/.test(result)) return null;
  if (/[. ]$/.test(result)) return null;
  if (result.length > 200) return null;
  return result;
}

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const corrected = decodedUnicodeFilename(downloadItem.filename);
  if (corrected) {
    suggest({ filename: corrected, conflictAction: "uniquify" });
  } else {
    suggest();
  }
});
