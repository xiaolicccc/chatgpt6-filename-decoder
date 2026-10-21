"use strict";

/**
 * Decode the leaf filename only, without touching the file bytes.
 * Chrome may expose an absolute filename, but onDeterminingFilename only
 * accepts paths relative to the configured default Downloads directory.
 */
function decodedUnicodeFilename(path) {
  if (typeof path !== "string" || !path) return null;
  const leaf = path.split(/[\\/]/).pop();
  if (!leaf || !/%[0-9a-f]{2}/i.test(leaf)) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(leaf);
  } catch (_) {
    return null; // Malformed percent escapes or invalid UTF-8.
  }

  // Do not reinterpret ordinary ASCII percent escapes such as %20.
  if (decoded === leaf || !/[^\x00-\x7f]/.test(decoded)) return null;

  // Block separators, control characters, invalid Windows characters and
  // directional formatting controls that could disguise a file extension.
  if (decoded === "." || decoded === "..") return null;
  if (/[\\/\x00-\x1f\x7f<>:"|?*\u202a-\u202e\u2066-\u2069]/.test(decoded)) return null;
  if (/[. ]$/.test(decoded) || decoded.length > 200) return null;
  return decoded;
}

/**
 * Preserve an existing safe relative subdirectory when available. When Chrome
 * supplies an absolute OS path, its Downloads root cannot be determined from
 * this event, so fall back to the corrected leaf filename (v1.0 behavior).
 */
function suggestedFilename(path) {
  const corrected = decodedUnicodeFilename(path);
  if (!corrected) return null;
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized)) {
    return corrected;
  }
  const pieces = normalized.split("/");
  const dirs = pieces.slice(0, -1);
  // Unsafe or ambiguous relative paths must not be passed back to Chrome.
  if (dirs.some((dir) => !dir || dir === "." || dir === ".." ||
      /[\x00-\x1f\x7f<>:"|?*\u202a-\u202e\u2066-\u2069]/.test(dir))) {
    return corrected;
  }
  return dirs.length ? dirs.join("/") + "/" + corrected : corrected;
}

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const filename = suggestedFilename(downloadItem.filename);
  if (filename) {
    suggest({ filename, conflictAction: "uniquify" });
  } else {
    suggest();
  }
});
