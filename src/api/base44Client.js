import { requireSupabase } from "@/api/supabaseClient";

const tableFor = {
  Story: "stories",
  Chapter: "chapters",
  BlogPost: "blogs",
  Comment: "comments",
  StoryRating: "story_ratings",
  Subscriber: "subscribers",
};

const idColumnFor = {
  Story: "id",
  Chapter: "id",
  BlogPost: "blog_id",
  Comment: "id",
  StoryRating: "id",
  Subscriber: "id",
};

function mapRow(entity, row) {
  if (!row) return row;
  if (entity === "BlogPost") {
    return {
      ...row,
      id: String(row.blog_id),
      blog_id: String(row.blog_id),
      publish_date: row.published_at,
      created_date: row.created_at,
      tags: Array.isArray(row.tags) ? row.tags : [],
    };
  }
  return {
    ...row,
    id: row.id == null ? row.id : String(row.id),
    tags: Array.isArray(row.tags) ? row.tags : row.tags,
    media: Array.isArray(row.media) ? row.media : row.media,
  };
}

async function resolveReference(entity, field, value) {
  if (value == null) return value;
  if (!["story_id", "chapter_id", "blog_id"].includes(field)) return value;

  if (field === "story_id" && entity !== "Story") {
    const supabase = requireSupabase();
    const { data } = await supabase.from("stories").select("id").eq("story_code", value).maybeSingle();
    return data?.id ?? value;
  }
  return value;
}

function normalizeFilter(entity, filter = {}) {
  return { ...filter };
}

async function listEntity(entity, filter = {}, sort, limit) {
  const table = tableFor[entity];
  if (!table) throw new Error(`Unsupported entity: ${entity}`);
  const supabase = requireSupabase();
  let query = supabase.from(table).select("*");

  for (const [field, rawValue] of Object.entries(normalizeFilter(entity, filter))) {
    const value = await resolveReference(entity, field, rawValue);
    if (Array.isArray(value)) query = query.in(field, value);
    else query = query.eq(field, value);
  }

  if (sort) {
    const descending = String(sort).startsWith("-");
    const field = String(sort).replace(/^-/, "");
    query = query.order(field, { ascending: !descending });
  }
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(entity, row));
}

function entityApi(entity) {
  const table = tableFor[entity];
  const idColumn = idColumnFor[entity];

  return {
    list: (sort, limit) => listEntity(entity, {}, sort, limit),
    filter: (filter, sort, limit) => listEntity(entity, filter, sort, limit),
    async get(id) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from(table).select("*").eq(idColumn, id).maybeSingle();
      if (error) throw error;
      return mapRow(entity, data);
    },
    async create(payload) {
      const supabase = requireSupabase();
      const input = { ...payload };
      if (entity === "Chapter" && typeof input.story_id === "string") input.story_id = await resolveReference(entity, "story_id", input.story_id);
      if (["Comment", "StoryRating"].includes(entity) && typeof input.story_id === "string") input.story_id = await resolveReference(entity, "story_id", input.story_id);
      if (entity === "Comment" && typeof input.blog_id === "string") input.blog_id = Number(input.blog_id);
      const { data, error } = await supabase.from(table).insert(input).select().single();
      if (error) throw error;
      return mapRow(entity, data);
    },
    async update(id, payload) {
      const supabase = requireSupabase();
      const { data, error } = await supabase.from(table).update(payload).eq(idColumn, id).select().single();
      if (error) throw error;
      return mapRow(entity, data);
    },
    async delete(id) {
      const supabase = requireSupabase();
      const { error } = await supabase.from(table).delete().eq(idColumn, id);
      if (error) throw error;
      return true;
    },
  };
}

export const base44 = {
  entities: Object.fromEntries(Object.keys(tableFor).map((name) => [name, entityApi(name)])),
  analytics: {
    track() {
      return Promise.resolve();
    },
  },
  auth: {
    async me() {
      const supabase = requireSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    async logout() {
      const supabase = requireSupabase();
      await supabase.auth.signOut();
      return true;
    },
    redirectToLogin(returnUrl = window.location.href) {
      const url = `/login?redirect=${encodeURIComponent(returnUrl)}`;
      window.location.assign(url);
    },
  },
};
