import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://andromedaarchiveonline.netlify.app";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const staticPaths = ["/", "/stories", "/blog", "/about", "/contact", "/search"];

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

async function fetchRows(table, query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) throw new Error(`${table} sitemap request failed: ${response.status}`);
  return response.json();
}

async function main() {
  const urls = new Map(staticPaths.map((url) => [url, null]));

  try {
    const stories = await fetchRows("stories", "select=id,story_code,updated_at,hidden&hidden=eq.false&order=updated_at.desc");
    for (const story of stories) {
      if (!story.story_code) continue;
      urls.set(`/story/${encodeURIComponent(story.story_code)}`, story.updated_at);
    }

    const blogs = await fetchRows("blogs", "select=blog_id,updated_at,published&published=eq.true&order=updated_at.desc");
    for (const blog of blogs) {
      if (!blog.blog_id) continue;
      urls.set(`/blog/${encodeURIComponent(blog.blog_id)}`, blog.updated_at);
    }

    const chapters = await fetchRows("chapters", "select=story_id,chapter_number,updated_at,published&published=eq.true&order=updated_at.desc");
    const storyCodeById = new Map(stories.map((story) => [String(story.id), story.story_code]));
    for (const chapter of chapters) {
      const storyCode = storyCodeById.get(String(chapter.story_id));
      if (!storyCode || !Number.isFinite(Number(chapter.chapter_number))) continue;
      urls.set(`/story/${encodeURIComponent(storyCode)}/chapter/${Number(chapter.chapter_number)}`, chapter.updated_at);
    }
  } catch (error) {
    console.warn(`[sitemap] Dynamic content could not be loaded: ${error.message}`);
    console.warn("[sitemap] Keeping the public static URLs so the build can still complete.");
  }

  const body = [...urls.entries()].map(([url, lastmod]) => `  <url>\n    <loc>${escapeXml(`${SITE_URL}${url}`)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : ""}\n  </url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  await fs.mkdir(path.resolve("public"), { recursive: true });
  await fs.writeFile(path.resolve("public/sitemap.xml"), xml, "utf8");
  console.log(`[sitemap] Wrote ${urls.size} URLs.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
