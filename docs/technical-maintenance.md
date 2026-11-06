# Technical maintenance and handover

This section is for the developer or server operator helping the website owner. For normal content edits, use the [owner's guide](maintenance.md). Do not run production commands against a development machine, or development commands against production, without checking the target.

## Code map: where to make a change

Paths below are relative to `portfolio-web`.

| Scope                                            | Files/folders to inspect                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Homepage                                         | `src/app/(public)/page.tsx`                                                                                |
| Public page routes                               | `src/app/(public)/`; list/detail presentation in `src/components/public/listing.tsx` and `detail.tsx`      |
| Header/footer and public shell                   | `src/app/(public)/layout.tsx`; navigation in `src/components/public/nav.tsx`                               |
| Shared cards, labels, portraits                  | `src/components/public/ui.tsx`                                                                             |
| Public design                                    | `src/app/globals.css`                                                                                      |
| Public animation                                 | `src/app/(public)/template.tsx`, `src/components/public/page-motion.tsx`, animation rules in `globals.css` |
| Contact form                                     | `src/components/public/contact-form.tsx`; backend contact service                                          |
| Article renderer and highlighting                | `src/components/public/rich-content.tsx`, `src/lib/highlight.ts`                                           |
| Diagrams / reading tools                         | `src/components/public/diagram.tsx`, `reader-tools.tsx`                                                    |
| Admin navigation and authentication boundary     | `src/components/admin/shell.tsx`, `src/app/admin/(console)/layout.tsx`                                     |
| Admin content forms and lists                    | `src/components/admin/content-editor.tsx`, `content-list.tsx`, `rich-editor.tsx`                           |
| Profile / files / inbox / settings / password UI | Matching modules under `src/components/admin/`                                                             |
| Backend calls, types, CSRF                       | `src/lib/api.ts`, `src/components/admin/api.ts`, `src/lib/generated/`                                      |
| SEO, sitemap, RSS                                | `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`, page metadata                          |
| Bundler, proxy, headers                          | `next.config.ts`, `package.json`                                                                           |
| Local production startup                         | `scripts/start.mjs`                                                                                        |
| Tests                                            | `src/lib/*.test.ts`, `tests/e2e/`, `playwright.config.ts`                                                  |
| CI/release/deployment                            | `.github/workflows/`, `deploy/`, [deployment guide](deployment.md)                                         |

Backend persistence and validation live in [portfolio-backend](https://github.com/isldevs/portfolio-backend). It uses Java 21, Spring Boot, JPA repositories, and MapStruct DTO mapping. Flyway owns database migrations. Changes to UI fields may require backend validation, DTO, API schema, and database changes as well; changing the frontend alone does not add a persistent feature.

## Local workflow and checks

Use the existing checkout in an isolated cloud task. No extra Git worktree is necessary. Read `AGENTS.md`, including the installed Next.js documentation guidance, before changing framework code.

Prerequisites: Node.js 22 LTS or newer, npm, and the configured backend/PostgreSQL. Keep `.env.local` private. For this cloud workspace, `/workspace/.runtime/tool-env.sh` and `dev.env` contain local tool/configuration setup; these are machine-specific and are not part of a fresh clone. Never print credential files.

From `portfolio-web`:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Check each command's result before continuing to release. `npm start` runs the production build on loopback, port 3000 by default, and copies the static/public assets into its standalone output. For code editing use `npm run dev` instead. `npm run dev:webpack` is a troubleshooting fallback; default development uses Turbopack.

Browser checks need the running frontend and backend:

```bash
npm run test:e2e
```

If using an existing system Chromium, set `CHROMIUM_EXECUTABLE_PATH` to its actual executable path. Otherwise use Playwright's supported browser installation. Authenticated workflows require the existing test administrator credentials supplied privately as `ADMIN_USERNAME` and `ADMIN_PASSWORD`; tests without those credentials are skipped, not passed. Test publishing creates and removes records: use a disposable development/test system, not the live content database.

A formatter or type check alone does not prove the site works. After a change, verify the affected public pages and admin flow, errors, mobile layout, keyboard use, and reduced-motion behavior. Use production mode for performance measurements. Local timings do not establish deployed performance.

## Animation and performance maintenance

- Animation duration, stagger, and reveal targets live in `page-motion.tsx`; route entrances, ambient hero motion, and hover rules live in `globals.css`.
- Keep animations on transforms/opacity. Avoid delaying route rendering or hiding content until JavaScript runs.
- Respect `prefers-reduced-motion` in both CSS and JavaScript. Keep observer cleanup on route changes.
- End route transforms at `none` so fixed-position reading tools keep their normal viewport behavior.
- Do not reintroduce the all-browser `htmlLimitedBots: /.*/` override unless the resulting metadata-streaming delay is deliberately required.
- Public requests use `no-store`. React request-scoped memoization shares duplicate reads in one render; it does not cache content between visitors. Changing this requires an explicit freshness/invalidation policy so CMS edits remain visible.
- Keep the supported-language highlighter imports bounded. The admin rich editor loads separately; avoid adding it to shared public layout imports.

## Environment configuration

| Name                                   | Meaning                                                                | Where used                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `API_BASE_URL`                         | Server-to-server backend origin, normally local on the deployment host | Public server reads; frontend proxy rewrites are resolved at build time                 |
| `SITE_URL`                             | Actual public HTTPS origin                                             | Canonical links, sharing metadata, feeds/sitemap; configure before build and at runtime |
| `PORT`                                 | Frontend listening port                                                | Local production start; default 3000                                                    |
| Backend database/media/admin variables | Backend configuration, not frontend browser configuration              | See backend documentation                                                               |

Do not place passwords in `NEXT_PUBLIC_*` variables: browser-visible values are public. Keep production service configuration outside release artifacts as described in the deployment guide.

## Updating code and deploying it

1. Confirm the repository, branch, and existing local changes before editing.
2. Implement the change and run the relevant checks above.
3. Review the diff for unintended files and secrets, then commit and push to the intended branch.
4. Prepare a tested release artifact with a unique release identifier. Follow [deployment](deployment.md), including the correct domain and backend origin.
5. Have the operator verify the trusted artifact/checksum and activate it on the actual server.
6. Check HTTPS homepage, a published detail page, public media/résumé, login, and the affected feature. Verify the contact inbox if contact behavior changed.
7. Record the deployed frontend/backend versions and retain the previous compatible release.

The frontend GitHub Actions packaging workflow builds artifacts. It does not log into a server and deploy them. Review the actual server/CI setup before assuming any automatic deployment exists.

## Server checks: only for the documented Linux VPS layout

These commands assume the systemd services from this project's templates have actually been installed. They do not apply to arbitrary hosting providers.

```bash
systemctl status portfolio-web
systemctl status portfolio-backend
journalctl -u portfolio-web -n 100 --no-pager
journalctl -u portfolio-backend -n 100 --no-pager
```

Inspect logs privately; redact secrets and personal message content before sharing. A process being active is not enough: check the public website and a real backend-driven page. Check PostgreSQL, disk space, media storage permissions, proxy routing, and certificate renewal as appropriate. Service restarts may sign administrators out and do not repair missing data.

## Backups, recovery, and rollback

Follow the backend's [backup/recovery guide](https://github.com/isldevs/portfolio-backend/blob/master/docs/backup-recovery.md) and [backup script](https://github.com/isldevs/portfolio-backend/blob/master/deploy/backup.sh). Its script assumes the documented VPS paths and PostgreSQL administrative access; it briefly stops the backend to keep database and media backups consistent. Arrange a suitable maintenance window before using it.

Back up the database and media together, protect environment configuration separately, encrypt copies stored off-host, record backup success, and rehearse recovery in isolation. A backup file existing is not proof it can be restored. Confirm actual schedules, retention, and recovery targets with the owner.

For a frontend-only regression, the operator can reactivate a retained compatible release using the [deployment procedure](deployment.md). Database migrations and restores need a separate plan; switching frontend releases cannot undo database changes. Restore against a verified target only, since restoring a database can replace newer content/messages.

## Handover checklist

- Owner can sign in, save a draft, publish, update Profile, replace a public file, and read messages.
- Owner understands that Settings edits content, GitHub holds code, and backups protect database/media.
- Real domain, hosting account, renewal contacts, protected credentials, and maintainer contact are recorded privately.
- Live release IDs, backend origin, persistent storage paths, backup schedule, and last restore test are recorded.
- Release/rollback procedure and HTTPS renewal are verified on the actual host.
- Every new feature includes owner instructions, a feature-map update, and relevant technical/test documentation.
