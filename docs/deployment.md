# Deploy the frontend independently

These templates target a single Linux VPS. They have not contacted or provisioned a server. Use a real domain, DNS, certificate, and secrets before activation. Keep PostgreSQL, Java, and Node listeners on loopback and allow external inbound traffic only to SSH, HTTP, and HTTPS.

## Prepare the host

Install Node.js 22 LTS, Nginx, systemd, and Certbot using the OS vendor's supported repositories. Create an unprivileged `portfolio-web` account, `/srv/portfolio/web/releases`, and `/etc/portfolio`. Use `/srv/portfolio/web/current` as an atomic symlink to a release. Copy `deploy/web.env.example` to `/etc/portfolio/web.env`, set the real `SITE_URL`, and protect the directory/file (root-owned, file mode `0600`). systemd reads the file before dropping privileges.

Copy `deploy/portfolio-web.service` to `/etc/systemd/system/`, verify the Node path (`command -v node`), then run `systemctl daemon-reload`. The unit's host and port settings bind to `127.0.0.1:3000`. The service can write its own Next cache but cannot write arbitrary host files. Adjust resource limits after measuring actual memory use.

## Build and publish an artifact

From a trusted checkout on CI or a build host:

```bash
export API_BASE_URL=http://127.0.0.1:8080
export SITE_URL=https://your-real-domain.example
./deploy/package-release.sh 2026-11-02.1 /tmp/portfolio-web-2026-11-02.1.tar.gz
```

This script installs with `npm ci`, runs lint/type checking/tests/build, and packages `server.js`, standalone runtime dependencies, static assets, and public files. Dependency installation and TLS/checksum verification must remain enabled. The rewrite upstream is resolved at build time; set `API_BASE_URL` before building. Public metadata also needs the proper `SITE_URL` at runtime.

Transfer the archive and its checksum over authenticated SSH from a trusted build source. Verify the checksum on the VPS (`sha256sum -c ...sha256`; edit only the filename path if the archive moved). A checksum detects corruption, not an untrusted publisher. Create a new directory named exactly for the release ID under `/srv/portfolio/web/releases`, extract the trusted archive there, and make it owned by `portfolio-web:portfolio-web` with no world-write permission. Never extract an untrusted archive as root.

```bash
sudo ./deploy/activate-release.sh 2026-11-02.1
```

The activation script switches `current`, restarts only the frontend, and checks a local HTTP response. It restores the previous frontend release if startup fails. Then verify real public content and administrator sign-in through HTTPS; a local readiness endpoint alone does not prove API integration. Keep at least the previous known-good release until the next release is verified.

## HTTPS and routing

Replace the domain and certificate paths in `deploy/nginx.conf`. For initial certificate issuance, enable only its port 80 server with an existing `/var/www/letsencrypt` directory, then use Certbot's webroot mode to issue the certificate. Enable the TLS server after the certificate exists. Test with `nginx -t`, reload Nginx, and enable the OS certificate-renewal timer. Verify renewal with `certbot renew --dry-run` and reload Nginx after renewal. Do not enable a template that refers to nonexistent certificate files.

The configuration proxies `/api/v1/` to Java and other routes to Next.js. It overwrites forwarded headers at the trust boundary, sets HTTPS security headers, and denies remote actuator/OpenAPI paths. The backend systemd template enables secure cookies. Do not bypass this HTTPS origin to administer production content.

## Rollback and operations

To roll back only the web application, activate a retained compatible release ID with the same script. API contracts must remain backward compatible across independent releases. If a backend change is incompatible, coordinate rollback with the backend's schema policy; a frontend symlink cannot undo a database migration.

Monitor `systemctl status portfolio-web`, `journalctl -u portfolio-web`, the HTTPS homepage, a published article, and the contact form. Alert on service restarts, 5xx rates, disk pressure, certificate expiry, and backup failures. Retain logs for a defined period and restrict access; do not log credentials or contact-message bodies. The backend documents persistent-data recovery.

## Release workflow

The `Package frontend release` GitHub Actions workflow can be triggered manually with a unique release ID. It builds/tests an artifact and checksum for download; it does not log into or deploy to a VPS. Set the repository variable `SITE_URL` to the production HTTPS origin before running it. Deploy the verified artifact with the activation procedure above. This keeps server access and maintenance/migration timing under the operator’s control.
