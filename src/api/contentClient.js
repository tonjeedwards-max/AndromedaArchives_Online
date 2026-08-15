import { requireSupabase } from "@/api/supabaseClient";

const mapStory = (row) => ({
  ...row,
  id: String(row.id),
  tags: Array.isArray(row.tags) ? row.tags : [],
});

const mapChapter = (row) => ({
  ...row,
  id: String(row.id),
  story_id: String(row.story_id),
  media: Array.isArray(row.media) ? row.media : [],
});

const mapBlog = (row) => ({
  ...row,
  id: String(row.blog_id),
  blog_id: String(row.blog_id),
  tags: Array.isArray(row.tags) ? row.tags : [],
  publish_date: row.published_at,
  created_date: row.created_at,
});

export async function listStories() {
  const { data, error } = await requireSupabase()
    .from("stories")
    .select("*")
    .eq("hidden", false)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStory);
}

export async function getStory(storyCode) {
  const { data, error } = await requireSupabase()
    .from("stories")
    .select("*")
    .eq("story_code", storyCode)
    .eq("hidden", false)
    .maybeSingle();
  if (error) throw error;
  return data ? mapStory(data) : null;
}

export async function listChaptersForStory(storyCode) {
  const story = await getStory(storyCode);
  if (!story) return [];
  const { data, error } = await requireSupabase()
    .from("chapters")
    .select("*")
    .eq("story_id", story.id)
    .eq("published", true)
    .order("chapter_number", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapChapter);
}

export async function getChapter(chapterId) {
  const { data, error } = await requireSupabase()
    .from("chapters")
    .select("*")
    .eq("id", chapterId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapChapter(data) : null;
}

export async function listBlogs() {
  const { data, error } = await requireSupabase()
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBlog);
}

export async function getBlog(blogId) {
  const { data, error } = await requireSupabase()
    .from("blogs")
    .select("*")
    .eq("blog_id", blogId)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBlog(data) : null;
}
