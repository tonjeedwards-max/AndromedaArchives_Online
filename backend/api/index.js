import { SupabaseStore } from './supabase-store.js';
import { StoryService } from './story-service.js';

const store = new SupabaseStore();
export const storyService = new StoryService(store);

export function createStoryApi() {
  return {
    listStories: (options) => storyService.listStories(options),
    getStory: (storyCode) => storyService.getStory(storyCode),
    listChapters: (storyCode, options) => storyService.listChapters(storyCode, options),
    getChapter: (storyCode, chapterNumber) => storyService.getChapter(storyCode, chapterNumber),
    createStory: (data, actor) => storyService.createStory(data, actor),
    updateStory: (storyCode, data, actor) => storyService.updateStory(storyCode, data, actor),
    deleteStory: (storyCode, actor) => storyService.deleteStory(storyCode, actor),
    createChapter: (data, actor) => storyService.createChapter(data, actor),
    updateChapter: (storyCode, chapterNumber, data, actor) => storyService.updateChapter(storyCode, chapterNumber, data, actor),
    deleteChapter: (storyCode, chapterNumber, actor) => storyService.deleteChapter(storyCode, chapterNumber, actor),
  };
}
