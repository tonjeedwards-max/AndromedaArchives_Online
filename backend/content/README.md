# Content data layer

This directory defines the persistent content model used by the independent backend.

## Tables

### stories
The catalogue record for each novel/story. `story_code` is the stable public identifier used by the existing frontend.

### chapters
A story's ordered chapters. Each chapter belongs to a story and `chapter_number` is unique within that story.

### blogs
The table-style blog upload model:

`blog_id | title | content | excerpt | date | tags | published`

The SQL implementation stores the date as `published_at` and tags as JSONB so the application can still expose the simple table-shaped payload.

## Upload workflow

CSV/table imports should target these logical fields rather than database-specific fields. The backend will validate and normalize records before persistence.

Do not put production credentials or database URLs in this directory or in Git.
