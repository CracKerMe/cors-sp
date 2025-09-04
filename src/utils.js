import tldjs from "tldjs";
import net from "node:net";

/**
 * 判断主机名是否合法
 * @param {string} hostname
 * @returns {boolean}
 */
export function isValidHostName(hostname) {
  if (!hostname) return false;
  if (net.isIPv4(hostname) || net.isIPv6(hostname)) return true;
  return tldjs.isValidHostname(hostname);
}
