import { createClient } from "@supabase/supabase-js";

function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the backend.");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class SupabaseStore {
  constructor(client = createSupabaseAdminClient()) {
    this.client = client;
  }

  async listStories() {
    const { data, error } = await this.client.from("stories").select("*");
    if (error) throw error;
    return data ?? [];
  }

  async getStory(storyCode) {
    const { data, error } = await this.client.from("stories").select("*").eq("story_code", storyCode).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createStory(story) {
    const { data, error } = await this.client.from("stories").insert(story).select().single();
    if (error) throw error;
    return data;
  }

  async updateStory(storyCode, data) {
    const { data: row, error } = await this.client.from("stories").update(data).eq("story_code", storyCode).select().maybeSingle();
    if (error) throw error;
    return row;
  }

  async deleteStory(storyCode) {
    const { error } = await this.client.from("stories").delete().eq("story_code", storyCode);
    if (error) throw error;
    return true;
  }

  async listChapters(storyId) {
    const { data, error } = await this.client.from("chapters").select("*").eq("story_id", storyId).order("chapter_number", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async createChapter(chapter) {
    const { data, error } = await this.client.from("chapters").insert(chapter).select().single();
    if (error) throw error;
    return data;
  }

  async updateChapter(storyId, chapterNumber, data) {
    const { data: row, error } = await this.client.from("chapters").update(data).eq("story_id", storyId).eq("chapter_number", chapterNumber).select().maybeSingle();
    if (error) throw error;
    return row;
  }

  async deleteChapter(storyId, chapterNumber) {
    const { error } = await this.client.from("chapters").delete().eq("story_id", storyId).eq("chapter_number", chapterNumber);
    if (error) throw error;
    return true;
  }
}
