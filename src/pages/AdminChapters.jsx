import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function AdminChapters() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState('');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await base44.entities.Story.list();
        if (active) setStories(data ?? []);
      } catch (err) {
        if (active) setError(err?.message || 'Unable to load stories.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedStory) {
      setChapters([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        setError('');
        const data = await base44.entities.Chapter.filter({ story_id: selectedStory });
        if (active) setChapters(data ?? []);
      } catch (err) {
        if (active) setError(err?.message || 'Unable to load chapters.');
      }
    })();
    return () => { active = false; };
  }, [selectedStory]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Chapter Management</h1>
        <p className="mt-2 text-muted-foreground">Manage chapters without changing the public reading experience.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <label htmlFor="story" className="mb-2 block text-sm font-medium">Story</label>
        <select
          id="story"
          value={selectedStory}
          onChange={(event) => setSelectedStory(event.target.value)}
          disabled={loading}
          className="w-full rounded-md border bg-background px-3 py-2"
        >
          <option value="">Select a story</option>
          {stories.map((story) => (
            <option key={story.story_code} value={story.story_code}>
              {story.title} ({story.story_code})
            </option>
          ))}
        </select>

        {selectedStory && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Chapter</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Published</th>
                  <th className="px-3 py-3">Words</th>
                </tr>
              </thead>
              <tbody>
                {chapters
                  .slice()
                  .sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number))
                  .map((chapter) => (
                    <tr key={`${chapter.story_id}-${chapter.chapter_number}`} className="border-b last:border-0">
                      <td className="px-3 py-3">{chapter.chapter_number}</td>
                      <td className="px-3 py-3">{chapter.title}</td>
                      <td className="px-3 py-3">{chapter.published === false ? 'No' : 'Yes'}</td>
                      <td className="px-3 py-3">{chapter.word_count ?? 0}</td>
                    </tr>
                  ))}
                {chapters.length === 0 && (
                  <tr><td colSpan="4" className="px-3 py-8 text-center text-muted-foreground">No chapters found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
