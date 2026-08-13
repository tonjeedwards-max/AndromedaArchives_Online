# Content import format

The admin/content uploader should accept table-shaped CSV files.

## Blog

Required columns:

`blog_id,title,content,excerpt,date,tags,published`

Example:

`8,"Character Study: Eden Pierce!","...","Tuesday Quick Cut...","August 4, 2026","[\"character study\",\"gloss and grit\"]",TRUE`

## Chapter

Required columns:

`story_id,title,chapter_number,content,published,word_count`

Example:

`BAF,"Chapter 1",1,"https://example.com/BAF/chapter-1.html",TRUE,3614`

## Story

`story_code,title,synopsis,cover_image,tags,status,hidden,sort_order,description`

The importer should normalize TRUE/FALSE, JSON-array tags, numbers, and dates before sending records to the API.

Large chapter content should be uploaded as a file/object and referenced by URL when appropriate; short markdown/text content may be stored directly in the database.
