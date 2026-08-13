/**
 * Framework-agnostic Story/Chapter service.
 *
 * This is intentionally independent of Base44. The persistence adapter can be
 * replaced with PostgreSQL later without changing the service contract.
 */

export class StoryService {
  constructor(store) {
    this.store = store;
  }

  async listStories({ includeHidden = false } = {}) {
    const stories = await this.store.listStories();
    return stories
      .filter((story) => includeHidden || !story.hidden)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }

  async getStory(storyCode) {
    return this.store.getStory(storyCode);
  }

  async listChapters(storyCode, { publishedOnly = true } = {}) {
    const chapters = await this.store.listChapters(storyCode);
    return chapters
      .filter((chapter) => !publishedOnly || chapter.published !== false)
      .sort((a, b) => a.chapter_number - b.chapter_number);
  }

  async getChapter(storyCode, chapterNumber) {
    const chapters = await this.store.listChapters(storyCode);
    return chapters.find(
      (chapter) => Number(chapter.chapter_number) === Number(chapterNumber)
    ) ?? null;
  }

  async createStory(data, actor) {
    assertAdmin(actor);
    if (!data?.title || !data?.story_code) {
      throw new Error('title and story_code are required');
    }
    return this.store.createStory(normalizeStory(data));
  }

  async updateStory(storyCode, data, actor) {
    assertAdmin(actor);
    return this.store.updateStory(storyCode, normalizeStory(data));
  }

  async deleteStory(storyCode, actor) {
    assertAdmin(actor);
    return this.store.deleteStory(storyCode);
  }

  async createChapter(data, actor) {
    assertAdmin(actor);
    if (!data?.story_id || !data?.title || data?.chapter_number == null) {
      throw new Error('story_id, title and chapter_number are required');
    }
    return this.store.createChapter(normalizeChapter(data));
  }

  async updateChapter(storyCode, chapterNumber, data, actor) {
    assertAdmin(actor);
    return this.store.updateChapter(
      storyCode,
      chapterNumber,
      normalizeChapter(data)
    );
  }

  async deleteChapter(storyCode, chapterNumber, actor) {
    assertAdmin(actor);
    return this.store.deleteChapter(storyCode, chapterNumber);
  }
}

function assertAdmin(actor) {
  if (actor?.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

function normalizeStory(data) {
  return {
    title: data.title,
    story_code: data.story_code,
    synopsis: data.synopsis ?? '',
    cover_image: data.cover_image ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    status: data.status ?? 'in_orbit',
    hidden: Boolean(data.hidden),
    sort_order: Number(data.sort_order ?? 0),
    description: data.description ?? ''
  };
}

function normalizeChapter(data) {
  return {
    story_id: data.story_id,
    title: data.title,
    chapter_number: Number(data.chapter_number),
    content: data.content ?? '',
    published: data.published !== false,
    word_count: Number(data.word_count ?? 0),
    media: Array.isArray(data.media) ? data.media : []
  };
}
