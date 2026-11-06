# Yi Sivlay — portfolio web

Next.js App Router application for Yi Sivlay's public portfolio, technical articles, and authenticated content management console. This repository deploys independently from `isldevs/portfolio-backend`; the versioned REST API is the integration boundary. The design uses near-black surfaces, mint accents, compact monospaced navigation, and terminal-style panels. No reference image was supplied with the implementation brief, so the written visual specification guides the design.

## Start here: maintaining your website

No web development experience is needed for normal content updates. Read the **[website owner's maintenance guide](docs/maintenance.md)** for step-by-step editing, publishing, media, messages, troubleshooting, and maintenance routines.

- [Every page and admin feature](docs/features.md): what each feature does and where to update it.
- [Technical maintenance and handover](docs/technical-maintenance.md): code locations, checks, releases, configuration, and backup/recovery references for your developer or server operator.

## Manage content

Append `/admin/login` to the website address to open the administrator sign-in screen. The public footer also links to **Admin login**. Keep the backend and PostgreSQL running while signing in or editing content.

There are no default credentials. On a fresh installation, set your own `ADMIN_USERNAME` and `ADMIN_PASSWORD` before the backend's first startup, following the backend README's secure bootstrap instructions. Passwords must contain at least 14 characters and fit within 72 UTF-8 bytes. Bootstrap creates the initial account only; changing those variables does not change an existing account. Use **Security** after signing in to change your password.

In the prepared cloud workspace only, development credentials already exist in the protected `/workspace/.runtime/dev.env` file. Retrieve them privately in your own terminal/editor; do not paste that file or its values into chat or logs. Fresh clones do not include this file and need credentials you choose yourself.

After signing in:

1. Open **Projects → Add project** to add work, or **Blog posts → Add article** to write a post.
2. Enter the title, slug, summary, content, and relevant details. Use **Save draft** to keep the item private; use **Publish project** or **Publish article** when it is ready for visitors.
3. Use **Profile**, **Experience**, **Skills**, and **Case studies** to maintain the rest of the portfolio. Add only verified personal and professional information.
4. Use **Media library** for images and résumé files, **Messages** for the contact inbox, and **Settings** for site configuration. **Categories** and **Tags** organize content.

Content is saved in PostgreSQL. Published changes appear on the public website without rebuilding or redeploying the frontend. See [architecture and API details](docs/architecture.md) and the [launch checklist](docs/launch-checklist.md).

## Run locally

Install Node.js 22 LTS or newer, npm, and the backend prerequisites in the backend README. No Docker is needed. Start PostgreSQL and the Spring Boot backend first.

```powershell
Set-Location portfolio-web
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Open the application at port 3000 on your own development machine. Public server components fetch the backend using server-only `API_BASE_URL`. Browser requests use relative `/api/v1` paths, proxied to Spring Boot by Next.js during development and by Nginx in production. `SITE_URL` controls canonical metadata, sitemap, and feed origins; change it to the real HTTPS origin before a production build. Never put backend credentials in a `NEXT_PUBLIC_*` variable.

The admin sign-in screen is `/admin/login`. Bootstrap an administrator using the backend instructions; this application contains no built-in credentials. Authentication uses HTTP-only server sessions with CSRF protection, never browser local-storage tokens.

## Navigation speed and motion

`npm run dev` uses Turbopack for incremental development. The first visit to a route still compiles it; development timings do not represent visitor performance. `npm run dev:webpack` is available for bundler troubleshooting.

For a production speed check, stop the development server, run `npm run build`, then `npm start`. Production routes are compiled during the build. Use this mode for demos and performance measurements. `npm start` assembles static assets alongside the standalone server before starting it. Set `PORT` if port 3000 is already in use. The API and database must be running in either mode. Public content remains live (`no-store`); request-scoped memoization shares duplicate metadata/page reads without caching content between requests. Browser metadata can stream, while Next.js retains its default crawler handling.

Public pages have short entrance and viewport reveals, subtle ambient hero motion, and hover/focus feedback. Animations never delay navigation or hide server-rendered content while waiting for JavaScript. Reduced-motion preferences disable motion, including when changed during a session. Heavy syntax highlighting is limited to the supported CMS languages, and the admin editor loads in its own chunk.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

These commands describe the available checks, not a claim that every environment has passed them. Integration and publishing checks require the running backend and PostgreSQL. The frontend CI installs with the committed lockfile and runs the checks above. Public pages render dynamically so published changes do not require rebuilding.

## Content and identity

The CMS stores profile data, projects, case studies, experience, skills, articles, categories, and tags in PostgreSQL. Samples are labeled as demonstrations. Employment, certifications, education, contact details, achievements, and metrics have not been invented. Supply a real portrait, résumé, verified experience, and contact details through the CMS before a public launch. Media uploads are managed by the backend.

## Documentation

- [Architecture and API contract](docs/architecture.md)
- [Deployment, releases, and rollback](docs/deployment.md)
- [Operational checklist](docs/launch-checklist.md)

Production uses a standalone Next.js build, an independent systemd unit, and an Nginx HTTPS reverse proxy. Deployment files are templates; they do not provision a VPS, issue a certificate, or deploy themselves. See the backend documentation for database migrations, backups, and administrator recovery.
