# Story + Chapter Migration Contract

This is the first backend contract for replacing Base44 without changing the existing frontend UI.

## Stories

The replacement API must preserve the current Story fields:

- `title` — required string
- `story_code` — required unique short identifier
- `synopsis` — string
- `cover_image` — string URL for now
- `tags` — string array
- `status` — `in_orbit` | `lost_in_space` | `in_production`
- `hidden` — boolean, default false
- `sort_order` — number, default 0
- `description` — optional string, maximum 1000 characters

Public read access is preserved. Create/update/delete are admin-only, matching the current Base44 rules.

## Chapters

The replacement API must preserve:

- `story_id` — parent story code
- `title` — required string
- `chapter_number` — required number
- `content` — markdown/plain text
- `published` — boolean, default true
- `word_count` — number
- `media` — string array of image URLs

Public read access is preserved. Create/update/delete are admin-only, matching the current Base44 rules.

## Migration principle

Do not alter the frontend's expected data shape during this phase. The replacement service should adapt its API responses to the existing frontend contract so `StoryHub`, `ChapterReader`, and related components can remain visually and structurally unchanged.
