/**
 * Escapes text for use inside an XML attribute value delimited by double
 * quotes. File names may legitimately contain `&` or `'`, which would
 * otherwise produce a malformed project file that Visual Studio refuses to
 * open.
 */
export function escapeXmlAttribute(value: string): string {
  return escapeXmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** Escapes text for use in an XML text node. */
export function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
