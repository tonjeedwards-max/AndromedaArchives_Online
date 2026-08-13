# Andromeda Archives Backend

This directory contains the replacement backend being built to remove the application's dependency on Base44.

## Migration rules

- The existing React/Vite frontend is preserved.
- Migration happens incrementally; Base44 remains available until each feature has been migrated and verified.
- The backend code lives in this repository, while runtime hosting, database hosting, and object/file storage will be selected separately.
- Story and chapter functionality is the first migration target.
- The existing `base44/entities` definitions are treated as the reference data model during migration.

## Planned layers

- `api/` — HTTP API contracts used by the existing frontend
- `db/` — database schema and migrations
- `services/` — application/business logic
- `storage/` — file/object-storage abstraction for covers and uploaded content
- `auth/` — replacement authentication implementation

Do not remove the existing Base44 integration until the corresponding replacement has been verified in the application.
