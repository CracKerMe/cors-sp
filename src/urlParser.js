/**
 * 解析目标 URL，支持 http(s)://、//、无协议等格式
 * @param {string} url
 * @returns {URL|null}
 */
export function parseURL(url) {
  if (!url) return null;
  try {
    // The url is the first part of the path, after the leading slash.
    // e.g. http://localhost:8080/http://example.com/
    let normalized = url.trim();
    if (normalized.startsWith("http:/") && !normalized.startsWith("http://")) {
      normalized = "http://" + normalized.substring("http:/".length);
    } else if (
      normalized.startsWith("https:/") &&
      !normalized.startsWith("https://")
    ) {
      normalized = "https://" + normalized.substring("https:/".length);
    }

    const urlObject = new URL(normalized);
    // The host of the URL object must be a valid hostname.
    // For example, "http://http://example.com" is not a valid URL.
    if (urlObject.hostname.includes(":")) {
      // The hostname contains a colon, which is not allowed.
      // This is a workaround for URLs like "http://http://example.com".
      const newUrl = url.substring(url.indexOf("//") + 2);
      return parseURL(newUrl);
    }
    return urlObject;
  } catch {
    return null;
  }
}
