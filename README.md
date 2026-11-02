# Yi Sivlay — portfolio web

Next.js App Router application for Yi Sivlay's public portfolio, technical articles, and authenticated content management console. This repository deploys independently from `isldevs/portfolio-backend`; the versioned REST API is the integration boundary. The design uses near-black surfaces, mint accents, compact monospaced navigation, and terminal-style panels. No reference image was supplied with the implementation brief, so the written visual specification guides the design.

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
