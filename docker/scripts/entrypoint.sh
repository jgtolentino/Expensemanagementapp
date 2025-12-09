#!/bin/bash
# =============================================================================
# InsightPulse AI Enterprise - Entrypoint Script
# =============================================================================
# This script handles:
# - Database initialization
# - Module installation/upgrade
# - Health checks
# =============================================================================

set -e

# =============================================================================
# Configuration
# =============================================================================
: "${HOST:=db}"
: "${PORT:=5432}"
: "${USER:=odoo}"
: "${PASSWORD:=odoo}"
: "${DB_NAME:=insightpulse}"
: "${AUTO_UPGRADE:=true}"
: "${INSTALL_MODULES:=ipai_ppm_clarity}"

# =============================================================================
# Functions
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

wait_for_postgres() {
    log "Waiting for PostgreSQL at $HOST:$PORT..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if pg_isready -h "$HOST" -p "$PORT" -U "$USER" > /dev/null 2>&1; then
            log "PostgreSQL is ready!"
            return 0
        fi

        log "Attempt $attempt/$max_attempts - PostgreSQL not ready, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    log "ERROR: PostgreSQL not available after $max_attempts attempts"
    exit 1
}

database_exists() {
    PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

initialize_database() {
    log "Checking if database '$DB_NAME' exists..."

    if database_exists; then
        log "Database '$DB_NAME' already exists"
    else
        log "Creating database '$DB_NAME'..."
        PGPASSWORD="$PASSWORD" createdb -h "$HOST" -p "$PORT" -U "$USER" "$DB_NAME"
        log "Database '$DB_NAME' created successfully"

        # Initialize Odoo database
        log "Initializing Odoo in database '$DB_NAME'..."
        odoo --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASSWORD" \
            -d "$DB_NAME" -i base --stop-after-init --without-demo=all
        log "Odoo initialized successfully"
    fi
}

install_modules() {
    if [ -z "$INSTALL_MODULES" ]; then
        log "No modules specified for installation"
        return 0
    fi

    log "Installing/upgrading modules: $INSTALL_MODULES"

    # Convert comma-separated to -i flag format
    local modules_flag=$(echo "$INSTALL_MODULES" | tr ',' ' ' | sed 's/[^ ]* */-i &/g' | tr -s ' ')

    odoo --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASSWORD" \
        -d "$DB_NAME" $modules_flag --stop-after-init --without-demo=all

    log "Modules installed/upgraded successfully"
}

upgrade_modules() {
    if [ "$AUTO_UPGRADE" != "true" ]; then
        log "Auto-upgrade disabled"
        return 0
    fi

    log "Running module upgrade..."

    odoo --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASSWORD" \
        -d "$DB_NAME" -u all --stop-after-init --without-demo=all

    log "Module upgrade completed"
}

# =============================================================================
# Main
# =============================================================================

log "=== InsightPulse AI Enterprise Starting ==="
log "Version: 2.1.0-clarity"
log "Database: $DB_NAME"
log "Modules: $INSTALL_MODULES"

# Wait for PostgreSQL
wait_for_postgres

# Initialize database if needed
initialize_database

# Install/upgrade modules on first run
if [ "$AUTO_UPGRADE" = "true" ]; then
    install_modules
fi

log "=== Starting Odoo Server ==="

# Start Odoo
exec odoo \
    --db_host="$HOST" \
    --db_port="$PORT" \
    --db_user="$USER" \
    --db_password="$PASSWORD" \
    -d "$DB_NAME" \
    "$@"
