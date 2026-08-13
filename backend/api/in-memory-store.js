export class InMemoryStore {
  constructor({ stories = [], chapters = [] } = {}) {
    this.stories = structuredClone(stories);
    this.chapters = structuredClone(chapters);
  }

  async listStories() { return structuredClone(this.stories); }

  async getStory(storyCode) {
    const story = this.stories.find((item) => item.story_code === storyCode);
    return story ? structuredClone(story) : null;
  }

  async createStory(story) {
    if (this.stories.some((item) => item.story_code === story.story_code)) throw new Error('story_code already exists');
    this.stories.push(structuredClone(story));
    return structuredClone(story);
  }

  async updateStory(storyCode, data) {
    const index = this.stories.findIndex((item) => item.story_code === storyCode);
    if (index === -1) return null;
    this.stories[index] = { ...this.stories[index], ...structuredClone(data) };
    return structuredClone(this.stories[index]);
  }

  async deleteStory(storyCode) {
    const before = this.stories.length;
    this.stories = this.stories.filter((item) => item.story_code !== storyCode);
    this.chapters = this.chapters.filter((item) => item.story_id !== storyCode);
    return before !== this.stories.length;
  }

  async listChapters(storyCode) {
    return structuredClone(this.chapters.filter((item) => item.story_id === storyCode));
  }

  async createChapter(chapter) {
    const duplicate = this.chapters.some((item) => item.story_id === chapter.story_id && item.chapter_number === chapter.chapter_number);
    if (duplicate) throw new Error('chapter_number already exists for this story');
    this.chapters.push(structuredClone(chapter));
    return structuredClone(chapter);
  }

  async updateChapter(storyCode, chapterNumber, data) {
    const index = this.chapters.findIndex((item) => item.story_id === storyCode && Number(item.chapter_number) === Number(chapterNumber));
    if (index === -1) return null;
    this.chapters[index] = { ...this.chapters[index], ...structuredClone(data) };
    return structuredClone(this.chapters[index]);
  }

  async deleteChapter(storyCode, chapterNumber) {
    const before = this.chapters.length;
    this.chapters = this.chapters.filter((item) => !(item.story_id === storyCode && Number(item.chapter_number) === Number(chapterNumber)));
    return before !== this.chapters.length;
  }
}
