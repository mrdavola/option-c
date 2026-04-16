# Security Guard Knowledge: Children's Platform Security

Sources: OWASP Top 10, COPPA guidelines, general web security best practices.

---

## OWASP Top 10 (relevant to our platform)

### 1. Broken Access Control (A01)
- Users should only access their own data
- Admin functions must be restricted to admin roles
- Firestore rules must enforce per-user access
- **Our risk:** No Firestore security rules exist. Any authenticated user can read/write anything.

### 2. Injection (A03)
- User input (game titles, backstories, pasted HTML) could contain malicious code
- HTML sanitization is critical for pasted games
- **Our risk:** Regex-based sanitizer misses `on*` event handlers

### 3. Security Misconfiguration (A05)
- Default configurations left in place
- Unnecessary features enabled
- **Our risk:** API routes without authentication, debug endpoints still active

### 4. Vulnerable Components (A06)
- Third-party libraries with known vulnerabilities
- CDN-loaded scripts without integrity hashes
- **Our risk:** Phaser loaded from jsdelivr without SRI hash

---

## COPPA Compliance (Children's Online Privacy Protection Act)

Since learners are CHILDREN at a school:

### What COPPA requires:
- **Parental consent** before collecting personal information from children under 13
- **Data minimization** — collect only what's necessary
- **Data security** — protect collected information
- **No behavioral advertising** to children
- **Right to delete** — parents can request deletion of child's data

### What we collect:
- Username (could be pseudonymous)
- Class code
- Game submissions (HTML content)
- Progress data (which standards mastered)
- Chat/hint interactions

### Recommendations:
- Use pseudonymous usernames (not real names)
- Don't collect email from children (collect from teacher/parent only)
- Store minimal personal data
- Provide teacher/admin ability to delete a student's data
- Review PostHog analytics — does it track children individually?

---

## Content Safety for Children

### What to scan in pasted HTML games:
- **Profanity/slurs** — word list check
- **Violence** — references to weapons, blood, killing
- **Sexual content** — any references
- **Hate speech** — discriminatory language
- **Phishing** — fake login forms, "enter your password"
- **External links** — links that take children off-platform
- **Crypto/gambling** — any references

### How to handle violations:
- **Block immediately** — don't show to other learners
- **Notify the guide/teacher** — not the child's parents directly (school context)
- **Log the event** — for pattern detection
- **Educate, don't punish** — children may not know content is inappropriate

---

## Iframe Security Checklist

### Current (good):
- ✅ `sandbox="allow-scripts"` (no same-origin access)
- ✅ CSP meta tag (blocks external scripts, fetch, forms)
- ✅ HTML sanitizer (strips external scripts, dangerous tags)

### Missing (fix):
- ❌ `on*` event handler attributes not stripped (onerror, onload, onfocus, etc.)
- ❌ No SRI on CDN-loaded scripts (Phaser)
- ❌ No timeout/kill switch for crashed games
- ❌ No content moderation layer for pasted HTML text content
- ❌ postMessage origin not validated (accepts from any origin)
