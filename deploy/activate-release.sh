#!/usr/bin/env bash
# VPS activation only; artifact must already be verified and extracted.
set -euo pipefail
release_id=${1:?Usage: activate-release.sh RELEASE_ID}
[[ "$release_id" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || exit 2
base=/srv/portfolio/web
release="$base/releases/$release_id"
[[ -f "$release/server.js" && -f "$release/RELEASE_ID" ]] || { echo 'Incomplete release' >&2; exit 2; }
[[ $(cat "$release/RELEASE_ID") == "$release_id" ]] || { echo 'Release ID mismatch' >&2; exit 2; }
old=$(readlink -f "$base/current" || true)
link="$base/.current.$$"
trap 'rm -f -- "$link"' EXIT
ln -s -- "$release" "$link"
mv -Tf -- "$link" "$base/current"
if systemctl restart portfolio-web; then
  for attempt in {1..30}; do
    if curl --fail --silent --max-time 3 http://127.0.0.1:3000/robots.txt >/dev/null; then
      printf 'Activated frontend %s\n' "$release_id"
      exit 0
    fi
    sleep 1
  done
fi
printf 'Frontend readiness failed; restoring previous release\n' >&2
if [[ -n "$old" && -d "$old" ]]; then
  ln -s -- "$old" "$link"
  mv -Tf -- "$link" "$base/current"
  systemctl restart portfolio-web
else
  systemctl stop portfolio-web
fi
exit 1
