#!/usr/bin/env bash
# Run on the VPS with sudo (as meheret): creates /opt/ingestmetricsd for spool.
set -euo pipefail

ROOT=/opt/ingestmetricsd
OWNER=spool
GROUP=spool

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

id "$OWNER" >/dev/null

mkdir -p "$ROOT"/{app,deploy,logs}
cat >"$ROOT/README" <<'EOF'
ingestmetricsd — metrics ingest edge daemon (internal).
Managed via docker compose project ingestmetricsd.
EOF

chown -R "$OWNER:$GROUP" "$ROOT"
chmod 750 "$ROOT"
chmod 640 "$ROOT/README" 2>/dev/null || true

echo "Provisioned $ROOT owned by $OWNER:$GROUP"
ls -la "$ROOT"
