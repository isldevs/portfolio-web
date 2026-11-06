# Feature-by-feature reference

Use the [owner's guide](maintenance.md) for step-by-step instructions. This reference tells you where each visible part of the website comes from.

## Public pages

| Page           | Address                                       | How to maintain it                                                                                                                                                                                                                                                          |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home           | `/`                                           | Profile controls identity/introduction. Publish Featured projects for the selected-project section. Publish articles, case studies, and skills for their sections. Settings controls services/tools. Only a limited selection appears here; use the full lists to see more. |
| About          | `/about`                                      | Update Profile, portrait, biography, links, and relevant profile details.                                                                                                                                                                                                   |
| Projects       | `/projects`                                   | Add/edit/publish Projects. Maintain category and technology labels for useful filters.                                                                                                                                                                                      |
| Project detail | `/projects/your-slug`                         | Edit that project's summary, main content, links, images, and details. Keep the slug stable once shared.                                                                                                                                                                    |
| Blog           | `/blog`                                       | Add/edit/publish Blog posts. Check category, tags, featured flag, and publish date shown by the site.                                                                                                                                                                       |
| Article detail | `/blog/your-slug`                             | Edit the article body. Headings create the table of contents. Reading time is calculated from the text. Use code blocks with the correct language; use Mermaid blocks for diagrams.                                                                                         |
| Case studies   | `/case-studies` and `/case-studies/your-slug` | Publish Case studies with relevant problem, solution, architecture, trade-offs, and lessons. Fill only details that apply.                                                                                                                                                  |
| Experience     | `/experience`                                 | Publish Experience records with accurate company, role, dates, and responsibilities.                                                                                                                                                                                        |
| Skills         | `/skills`                                     | Publish Skills and maintain their relevant labels/details.                                                                                                                                                                                                                  |
| Contact        | `/contact`                                    | Maintain public contact links in Profile. The contact form saves messages to Admin → Messages.                                                                                                                                                                              |
| Résumé         | `/resume`                                     | Upload a public PDF and save its URL in Profile → Resume PDF URL. Verify the download after replacing it.                                                                                                                                                                   |
| Page not found | Any unknown/unpublished URL                   | A missing, moved, draft, or archived item may show 404. Check the slug and publication status first. The page's visual design is maintained in code.                                                                                                                        |

## Administrator screens

All these screens require sign-in except the login screen itself.

| Menu          | Address               | Purpose and important behavior                                                                                                                            |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign in       | `/admin/login`        | Existing administrator credentials; no default account or self-service password-reset flow.                                                               |
| Dashboard     | `/admin`              | Counts of projects/articles/unread messages and recent audit activity. Values come from the database.                                                     |
| Profile       | `/admin/profile`      | Identity, biography, portrait, résumé, public links, and search-preview text. Saving applies directly. Uploads must also be saved to the profile.         |
| Projects      | `/admin/projects`     | Manage project records, publication status, featured placement, and ordering.                                                                             |
| Blog posts    | `/admin/blog`         | Manage articles, rich text/code/diagrams, publication, and revision restoration. Backend names articles as `articles`; the admin route calls them `blog`. |
| Case studies  | `/admin/case-studies` | Manage longer explanations of engineering work and decisions.                                                                                             |
| Experience    | `/admin/experience`   | Manage employment/experience records. Backend resource name is `experiences`.                                                                             |
| Skills        | `/admin/skills`       | Manage expertise records.                                                                                                                                 |
| Categories    | `/admin/categories`   | Organize content; referenced labels may be protected from changes/deletion. Check labels in affected content too.                                         |
| Tags          | `/admin/tags`         | Organize content; keep labels consistent and update references before renaming/deleting.                                                                  |
| Media library | `/admin/media`        | Upload supported files, choose visibility, search, copy URLs, and delete unused assets. Referenced assets are protected.                                  |
| Messages      | `/admin/messages`     | Private contact inbox; search/filter, update status, delete when appropriate. No automatic email delivery.                                                |
| Settings      | `/admin/settings`     | Homepage services and tools, one per line. Not hosting/environment configuration.                                                                         |
| Security      | `/admin/security`     | Change your password and sign in again afterward.                                                                                                         |

For generic content resources, `/new` opens the add form and `/{id}/edit` opens an existing item. The list screen provides the appropriate links; you do not need to type record identifiers manually.

## Shared content fields

| Field                                                    | Practical advice                                                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                                                    | A clear human-readable name.                                                                                                                                              |
| Slug                                                     | The address-friendly identifier. Use `lowercase-words-with-hyphens`; avoid changing shared URLs.                                                                          |
| Summary                                                  | A short introduction for cards and previews.                                                                                                                              |
| Content/body                                             | The full text, headings, lists, media, links, and code.                                                                                                                   |
| Category, tags, technologies                             | Keep spelling consistent so filters group records as intended.                                                                                                            |
| Cover image / image URL                                  | Use a public media URL for visitor-facing images.                                                                                                                         |
| GitHub/demo/external links                               | Use valid HTTP/HTTPS links and test them from the public page.                                                                                                            |
| SEO title / description / canonical URL, where available | Search-preview information. A canonical URL tells search engines which address is preferred. Ask a maintainer if you are unsure before setting an external canonical URL. |
| Featured                                                 | Enables featured selection on pages that use it; it does not itself publish the item.                                                                                     |
| Display order                                            | Smaller numbers sort first in lists using default ordering.                                                                                                               |
| Status                                                   | Draft, Published, or Archived. Only Published content is publicly listed.                                                                                                 |
| Version                                                  | Managed by the application to detect conflicting edits. Reload instead of editing it manually.                                                                            |

The editor shows different detail fields for each resource. Use the labels shown in that form; do not enter raw JSON or change database rows to add an unsupported field. Adding a new field or a new public page is a code change.

## Features maintained by code or server configuration

| Feature                                   | How it works                                                                         | Maintenance location                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop/mobile navigation                 | Shared links; mobile menu; active-route and pending feedback                         | `src/components/public/nav.tsx`                                                                                                                 |
| Colors, typography, layout, hover effects | Shared public styles                                                                 | `src/app/globals.css`                                                                                                                           |
| Page/scroll animations                    | Public route template and viewport observer; honors reduced-motion preferences       | `src/app/(public)/template.tsx`, `src/components/public/page-motion.tsx`, public CSS                                                            |
| Loading and error screens                 | Loading skeleton, unavailable-content message, error/not-found pages                 | `src/app/(public)/loading.tsx`, `src/components/public/ui.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`                                    |
| Search and filters                        | Queries published backend content                                                    | `src/components/public/listing.tsx`, backend content service                                                                                    |
| Article formatting                        | Structured text rendering, supported code languages, diagrams, copy-code tools       | `src/components/public/rich-content.tsx`, `src/lib/highlight.ts`, `src/components/public/diagram.tsx`, `src/components/public/reader-tools.tsx` |
| SEO and social sharing                    | Metadata and structured data use content/profile values; domain uses `SITE_URL`      | `src/lib/seo.ts`, page metadata, environment settings                                                                                           |
| Sitemap and RSS                           | Generated from published content                                                     | `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`                                                                                                |
| Login and write protection                | Backend sessions and CSRF; frontend sends same-origin requests                       | Backend security/auth; frontend admin/API helpers                                                                                               |
| API routing                               | Frontend forwards `/api/v1` requests to backend; production Nginx can route directly | `next.config.ts`, deployment proxy configuration                                                                                                |
| Persistent storage                        | PostgreSQL stores records; media files live separately                               | Backend and server storage configuration                                                                                                        |
| Release and recovery                      | Tested build artifacts; service startup; coordinated backups                         | `deploy/`, [technical guide](technical-maintenance.md)                                                                                          |

Supported code-block languages are Java, SQL, JSON, YAML, XML, Bash/shell, TypeScript, JavaScript, and plain text, including the existing `ts`, `js`, and `sh` aliases. Other language labels display plain text. Mermaid diagrams have their own rendering path.

## Current limits to remember

- No automatic email replies or contact notification emails.
- No scheduled publishing.
- No universal administrator password or self-service forgotten-password screen.
- No automatic redirect when a content slug changes.
- No recycle bin for deleted content or messages.
- No automatic live deployment merely because code was pushed to GitHub.
- Backup jobs, domain renewal, HTTPS, and monitoring require actual server configuration.
