# Story and Chapter API

The first replacement backend exposes these contracts:

- `GET /api/stories` — list stories
- `GET /api/stories/:id` — fetch a story
- `GET /api/chapters` — list chapters; supports `story_id`, `published`, and `sort=chapter_number`
- `GET /api/chapters/:id` — fetch a chapter
- `POST /api/stories` — admin create
- `PUT /api/stories/:id` — admin update
- `DELETE /api/stories/:id` — admin delete
- `POST /api/chapters` — admin create
- `PUT /api/chapters/:id` — admin update
- `DELETE /api/chapters/:id` — admin delete

The response shapes intentionally match the existing Base44 Story and Chapter entities so the current frontend does not need a visual rewrite.
