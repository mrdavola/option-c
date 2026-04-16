// Sanitize game HTML to prevent security issues.
// Called before saving any game HTML to Firestore.
//
// What we allow:
//   - Inline <script> (the game needs it)
//   - Inline styles
//   - Canvas, SVG, standard HTML elements
//
// What we strip:
//   - External <script src="..."> (could load malicious code)
//   - <iframe>, <object>, <embed>, <applet> (could embed external content)
//   - <link> tags (could load external CSS with tracking)
//   - <meta http-equiv="refresh"> (could redirect)
//   - <form action="..."> (could submit data to external servers)
//   - <base> tags (could redirect all relative URLs)
//   - Event handler attributes pointing to external URLs
//   - data: and javascript: URLs in src/href attributes

export function sanitizeGameHtml(html: string): string {
  let sanitized = html

  // Remove <script src="..."> tags (external scripts) but keep inline <script>...</script>
  // Match <script with any src attribute
  sanitized = sanitized.replace(/<script[^>]+src\s*=\s*["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, "<!-- external script removed -->")
  sanitized = sanitized.replace(/<script[^>]+src\s*=\s*["'][^"']*["'][^>]*\/>/gi, "<!-- external script removed -->")

  // Remove dangerous elements entirely
  const dangerousTags = ["iframe", "object", "embed", "applet", "base"]
  for (const tag of dangerousTags) {
    // Self-closing and paired
    const pairedRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi")
    const selfRegex = new RegExp(`<${tag}[^>]*\\/?>`, "gi")
    sanitized = sanitized.replace(pairedRegex, `<!-- ${tag} removed -->`)
    sanitized = sanitized.replace(selfRegex, `<!-- ${tag} removed -->`)
  }

  // Remove <link> tags (could load external stylesheets with tracking pixels)
  sanitized = sanitized.replace(/<link[^>]*\/?>/gi, "<!-- link removed -->")

  // Remove <meta http-equiv="refresh"> (redirect attacks)
  sanitized = sanitized.replace(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*\/?>/gi, "<!-- meta refresh removed -->")

  // Remove javascript: and data: URLs from src and href attributes
  sanitized = sanitized.replace(/(src|href)\s*=\s*["']javascript:[^"']*["']/gi, '$1=""')
  sanitized = sanitized.replace(/(src|href)\s*=\s*["']data:(?!image\/)[^"']*["']/gi, '$1=""')

  // Remove ALL on* event handler attributes (onerror, onload, onfocus, onclick, etc.)
  // These can execute arbitrary JS: <img src=x onerror="alert(1)">
  // We keep onclick etc. inside <script> tags (inline JS is allowed), but strip them from HTML attributes.
  sanitized = sanitized.replace(/<([a-z][a-z0-9]*)\s([^>]*)\bon[a-z]+\s*=\s*["'][^"']*["']([^>]*)\/?>/gi, (match) => {
    // Strip all on* attributes from the tag
    return match.replace(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi, "")
  })
  // Handle on* with unquoted values: onerror=alert(1)
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*[^\s>"']+/gi, "")

  // Remove <form> action pointing to external URLs
  sanitized = sanitized.replace(/<form[^>]*action\s*=\s*["']https?:\/\/[^"']*["'][^>]*>/gi, (match) => {
    return match.replace(/action\s*=\s*["'][^"']*["']/i, 'action=""')
  })

  // Inject Content-Security-Policy to lock down the iframe further.
  // Blocks all external network requests, scripts, forms.
  const cspTag = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">`
  if (sanitized.toLowerCase().includes("<head>")) {
    sanitized = sanitized.replace(/<head>/i, `<head>\n${cspTag}`)
  } else if (sanitized.toLowerCase().includes("<html")) {
    sanitized = sanitized.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${cspTag}</head>`)
  } else {
    sanitized = cspTag + "\n" + sanitized
  }

  return sanitized
}

// Quick check that returns a list of security issues found (for display to user)
export function findSecurityIssues(html: string): string[] {
  const issues: string[] = []
  if (/<script[^>]+src\s*=/i.test(html)) issues.push("External script tags (will be removed)")
  if (/<iframe/i.test(html)) issues.push("Embedded iframes (will be removed)")
  if (/<object|<embed|<applet/i.test(html)) issues.push("Embedded objects (will be removed)")
  if (/<link[^>]*>/i.test(html)) issues.push("External link tags (will be removed)")
  if (/<meta[^>]*http-equiv\s*=\s*["']refresh/i.test(html)) issues.push("Meta refresh redirect (will be removed)")
  if (/javascript:/i.test(html)) issues.push("javascript: URLs (will be removed)")
  if (/\bon[a-z]+\s*=/i.test(html)) issues.push("Inline event handlers like onerror/onload (will be removed)")
  return issues
}
