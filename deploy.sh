#!/usr/bin/env bash
set -euo pipefail

show_usage() {
  cat <<'USAGE'
Usage: ./deploy.sh <git-ref>
Deploy the project using Docker Compose from the specified git ref.

Examples:
  ./deploy.sh v1.0.0
  ./deploy.sh main
USAGE
}

if [ "$#" -ne 1 ]; then
  show_usage
  exit 1
fi

TARGET_REF="$1"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is required but not installed." >&2
  exit 2
fi

find_docker_compose() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    return 1
  fi
}

DOCKER_COMPOSE_CMD=$(find_docker_compose) || {
  echo "ERROR: Docker Compose command not found. Install Docker Compose or use Docker with compose plugin." >&2
  exit 3
}

if ! git rev-parse --verify --quiet "$TARGET_REF" >/dev/null 2>&1; then
  echo "ERROR: git ref '$TARGET_REF' not found." >&2
  exit 4
fi

ORIGINAL_HEAD="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"

printf 'Deploying git ref %s\n' "$TARGET_REF"

git checkout --detach "$TARGET_REF"

if [ ! -f docker-compose.yml ]; then
  echo "ERROR: docker-compose.yml not found in project root." >&2
  exit 5
fi

export COMPOSE_HTTP_TIMEOUT=200

echo "Using compose command: $DOCKER_COMPOSE_CMD"
$DOCKER_COMPOSE_CMD -f docker-compose.yml up --build --force-recreate -d
$DOCKER_COMPOSE_CMD -f docker-compose.yml ps

printf '\nDeployment complete for %s\n' "$TARGET_REF"

if [ -n "$ORIGINAL_HEAD" ] && [ "$ORIGINAL_HEAD" != "HEAD" ]; then
  echo "Restoring original branch: $ORIGINAL_HEAD"
  git checkout "$ORIGINAL_HEAD"
fi
