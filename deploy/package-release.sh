#!/usr/bin/env bash
# Run from any directory. Builds and packages a standalone frontend artifact.
set -euo pipefail
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo"
release_id=${1:?Usage: deploy/package-release.sh RELEASE_ID OUTPUT_TARBALL}
archive=${2:?Usage: deploy/package-release.sh RELEASE_ID OUTPUT_TARBALL}
[[ "$release_id" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || { echo 'Invalid release ID' >&2; exit 2; }
[[ "$archive" = /* ]] || archive="$PWD/$archive"
[[ ! -e "$archive" ]] || { echo 'Output already exists' >&2; exit 2; }
npm ci
npm run lint
npm run typecheck
npm test
npm run build
stage=$(mktemp -d)
trap 'rm -rf -- "$stage"' EXIT
cp -a .next/standalone/. "$stage/"
# Runtime configuration belongs in /etc/portfolio, never in release artifacts.
find "$stage" -maxdepth 1 -type f -name ".env*" -delete
mkdir -p "$stage/.next"
cp -a .next/static "$stage/.next/static"
if [[ -d public ]]; then cp -a public "$stage/public"; fi
printf '%s\n' "$release_id" > "$stage/RELEASE_ID"
tar -czf "$archive" -C "$stage" .
sha256sum "$archive" > "$archive.sha256"
printf 'Packaged %s\n' "$archive"
