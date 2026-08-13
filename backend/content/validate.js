const STORY_STATUSES = new Set(['in_orbit', 'lost_in_space', 'in_production']);

export function validateStory(input) {
  const errors = [];
  if (!input?.story_code) errors.push('story_code is required');
  if (!input?.title) errors.push('title is required');
  if (input?.status && !STORY_STATUSES.has(input.status)) errors.push('invalid status');
  if (input?.description && input.description.length > 1000) errors.push('description must be 1000 characters or fewer');
  if (input?.tags != null && !Array.isArray(input.tags)) errors.push('tags must be an array');
  return errors;
}

export function validateChapter(input) {
  const errors = [];
  if (!input?.story_id) errors.push('story_id is required');
  if (!input?.title) errors.push('title is required');
  if (input?.chapter_number == null || Number.isNaN(Number(input.chapter_number))) errors.push('chapter_number must be a number');
  if (input?.media != null && !Array.isArray(input.media)) errors.push('media must be an array');
  return errors;
}

export function validateBlog(input) {
  const errors = [];
  if (!input?.title) errors.push('title is required');
  if (!input?.content) errors.push('content is required');
  if (input?.tags != null && !Array.isArray(input.tags)) errors.push('tags must be an array');
  if (input?.date && Number.isNaN(Date.parse(input.date))) errors.push('date is invalid');
  return errors;
}
