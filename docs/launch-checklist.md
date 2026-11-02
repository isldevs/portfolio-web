# Launch checklist

The code and deployment templates need site-specific content and a real deployment target before public launch. Record check results; do not treat this list as proof of completion.

- Replace labeled sample projects/articles with reviewed content or retain clear demonstration labels. Do not invent employers, education, certifications, metrics, or private contact information.
- Upload a real authorized portrait and résumé; verify public/private media selection and that résumé downloads return the intended PDF.
- Set the real `SITE_URL`, verify canonical URLs, sitemap, RSS, Open Graph, robots policy, and that drafts never appear in these outputs.
- Test keyboard navigation, focus, labels, error states, reduced motion, narrow layouts, and rich article content. Measure Lighthouse/Core Web Vitals against a deployed representative page; no performance score is asserted by this implementation.
- Verify administrator session cookies are Secure/HttpOnly/SameSite, mutations reject missing CSRF, logout/password change closes sessions, and anonymous API requests cannot access CMS or messages.
- Run publishing and contact workflows against PostgreSQL and the real same-origin proxy. Verify content changes appear without a frontend redeploy.
- Configure HTTPS renewal, service monitoring, disk alerts, least-privilege accounts, off-host encrypted backups, and a successful restoration rehearsal.
- Keep admin pages outside search indexing. Review uploaded private data, log retention, and contact-message retention with the owner.

No scheduling, email delivery, or external analytics service is implied. Contact messages are persisted to the admin inbox. Publication is immediate when an authorized editor publishes content; do not advertise scheduled publishing without an implemented scheduler.
