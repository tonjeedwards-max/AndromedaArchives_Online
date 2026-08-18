import React, { useEffect, useMemo, useState } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { countWords, htmlToPlainText, sanitizeChapterHtml } from "@/lib/htmlContent";
import { Loader2, Upload, Save, Eye, FileText, BookOpen, Newspaper, RefreshCw } from "lucide-react";

const emptyChapter = { story_id: "", chapter_number: 1, title: "", content: "", published: false };
const emptyStory = { story_code: "", title: "", synopsis: "", description: "", cover_image: "", tags: "", status: "in_orbit", hidden: false, sort_order: 0 };
const emptyBlog = { blog_id: "", title: "", content: "", excerpt: "", tags: "", published_at: "" };

export default function AdminContent() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState("chapters");
  const [stories, setStories] = useState([]);
  const [chapter, setChapter] = useState(emptyChapter);
  const [story, setStory] = useState(emptyStory);
  const [blog, setBlog] = useState(emptyBlog);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStories, setLoadingStories] = useState(true);

  const loadStories = async () => {
    setLoadingStories(true);
    const { data, error: loadError } = await requireSupabase().from("stories").select("id, story_code, title").order("title");
    if (loadError) setError(loadError.message);
    setStories(data || []);
    setLoadingStories(false);
  };

  useEffect(() => {
    if (isAdmin) loadStories();
  }, [isAdmin]);

  const wordCount = useMemo(() => countWords(chapter.content), [chapter.content]);

  const clearStatus = () => { setMessage(""); setError(""); };

  const handleHtmlFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearStatus();
    try {
      const html = await file.text();
      const safe = sanitizeChapterHtml(html);
      setChapter((current) => ({ ...current, content: safe, title: current.title || file.name.replace(/\.html?$/i, "") }));
      setMessage(`Loaded ${file.name}. ${countWords(safe).toLocaleString()} words detected.`);
      setPreview(true);
    } catch (err) {
      setError(err.message || "Unable to read HTML file.");
    } finally {
      event.target.value = "";
    }
  };

  const saveChapter = async (publish = false) => {
    setSaving(true); clearStatus();
    try {
      if (!chapter.story_id || !chapter.title.trim() || !chapter.content.trim()) throw new Error("Story, chapter title, and HTML content are required.");
      const safe = sanitizeChapterHtml(chapter.content);
      const payload = {
        story_id: Number(chapter.story_id),
        chapter_number: Number(chapter.chapter_number),
        title: chapter.title.trim(),
        content: safe,
        published: publish,
        word_count: countWords(safe),
        media: [],
      };
      const { error: saveError } = await requireSupabase().from("chapters").upsert(payload, { onConflict: "story_id,chapter_number" });
      if (saveError) throw saveError;
      setChapter((current) => ({ ...emptyChapter, chapter_number: Number(current.chapter_number) + 1, story_id: current.story_id }));
      setPreview(false);
      setMessage(publish ? "Chapter published." : "Chapter saved as draft.");
    } catch (err) { setError(err.message || "Unable to save chapter."); }
    finally { setSaving(false); }
  };

  const saveStory = async () => {
    setSaving(true); clearStatus();
    try {
      if (!story.story_code.trim() || !story.title.trim()) throw new Error("Story code and title are required.");
      const tags = story.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
      const payload = { story_code: story.story_code.trim(), title: story.title.trim(), synopsis: story.synopsis, description: story.description, cover_image: story.cover_image, tags, status: story.status, hidden: story.hidden, sort_order: Number(story.sort_order) || 0 };
      const { error: saveError } = await requireSupabase().from("stories").upsert(payload, { onConflict: "story_code" });
      if (saveError) throw saveError;
      await loadStories();
      setMessage("Story saved.");
    } catch (err) { setError(err.message || "Unable to save story."); }
    finally { setSaving(false); }
  };

  const saveBlog = async (publish = false) => {
    setSaving(true); clearStatus();
    try {
      if (!blog.title.trim()) throw new Error("Blog title is required.");
      const safe = sanitizeChapterHtml(blog.content);
      const plain = htmlToPlainText(safe);
      const payload = {
        ...(blog.blog_id ? { blog_id: Number(blog.blog_id) } : {}),
        title: blog.title.trim(),
        content: safe,
        excerpt: blog.excerpt.trim() || plain.slice(0, 220),
        tags: blog.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        published: publish,
        published_at: publish ? (blog.published_at || new Date().toISOString()) : null,
      };
      const { error: saveError } = await requireSupabase().from("blogs").upsert(payload, { onConflict: "blog_id" });
      if (saveError) throw saveError;
      setMessage(publish ? "Blog post published." : "Blog post saved as draft.");
    } catch (err) { setError(err.message || "Unable to save blog post."); }
    finally { setSaving(false); }
  };

  if (!isAdmin) {
    return <main className="max-w-3xl mx-auto px-6 py-20 text-center"><h1 className="text-2xl font-semibold">Content Manager</h1><p className="mt-3 text-muted-foreground">Admin access is required. Sign in with the Supabase account assigned the admin role.</p>{user?.email && <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8"><h1 className="text-3xl font-semibold tracking-tight">Content Manager</h1><p className="mt-2 text-muted-foreground">Upload and publish stories, HTML chapters, and blog posts directly to Supabase.</p></div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[['stories','Stories',BookOpen],['chapters','Chapters',FileText],['blogs','Blogs',Newspaper]].map(([key,label,Icon]) => <button key={key} onClick={() => { setTab(key); clearStatus(); }} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${tab === key ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}><Icon className="w-4 h-4" />{label}</button>)}
      </div>
      {message && <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">{message}</div>}
      {error && <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div>}

      {tab === "chapters" && <section className="rounded-xl border bg-card p-6 space-y-5">
        <div><h2 className="text-xl font-semibold">New Chapter</h2><p className="text-sm text-muted-foreground">Upload an existing .html chapter or paste HTML. Formatting is sanitized and preserved for readers.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          <label className="text-sm">Story<select value={chapter.story_id} onChange={e => setChapter({...chapter, story_id:e.target.value})} disabled={loadingStories} className="mt-2 w-full rounded-md border bg-background px-3 py-2"><option value="">Select a story</option>{stories.map(s=><option key={s.id} value={s.id}>{s.title} ({s.story_code})</option>)}</select></label>
          <label className="text-sm">Chapter number<input type="number" min="1" value={chapter.chapter_number} onChange={e=>setChapter({...chapter,chapter_number:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm">Title<input value={chapter.title} onChange={e=>setChapter({...chapter,title:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label>
        </div>
        <div className="flex flex-wrap gap-3 items-center"><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"><Upload className="w-4 h-4" />Upload HTML<input type="file" accept=".html,.htm,text/html" onChange={handleHtmlFile} className="hidden" /></label><button onClick={loadStories} disabled={loadingStories} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"><RefreshCw className={`w-4 h-4 ${loadingStories ? 'animate-spin' : ''}`} />Refresh stories</button><span className="text-sm text-muted-foreground">{wordCount.toLocaleString()} words</span><button onClick={()=>setPreview(!preview)} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"><Eye className="w-4 h-4" />{preview ? 'Edit HTML' : 'Preview'}</button></div>
        {!preview ? <textarea value={chapter.content} onChange={e=>setChapter({...chapter,content:e.target.value})} placeholder="Paste chapter HTML here..." className="min-h-[420px] w-full rounded-md border bg-background p-4 font-mono text-sm" /> : <div className="min-h-[420px] rounded-md border bg-background p-6 prose prose-lg max-w-none" dangerouslySetInnerHTML={{__html:sanitizeChapterHtml(chapter.content)}} />}
        <div className="flex gap-3"><button disabled={saving} onClick={()=>saveChapter(false)} className="inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm hover:bg-muted">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}Save Draft</button><button disabled={saving} onClick={()=>saveChapter(true)} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:opacity-90">Publish</button></div>
      </section>}

      {tab === "stories" && <section className="rounded-xl border bg-card p-6 space-y-5"><h2 className="text-xl font-semibold">Story</h2><div className="grid gap-5 md:grid-cols-2"><label className="text-sm">Story code<input value={story.story_code} onChange={e=>setStory({...story,story_code:e.target.value})} placeholder="BAF" className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm">Title<input value={story.title} onChange={e=>setStory({...story,title:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label></div><label className="text-sm block">Synopsis<textarea value={story.synopsis} onChange={e=>setStory({...story,synopsis:e.target.value})} className="mt-2 w-full rounded-md border bg-background p-3" /></label><label className="text-sm block">Description<textarea value={story.description} onChange={e=>setStory({...story,description:e.target.value})} className="mt-2 w-full rounded-md border bg-background p-3" /></label><div className="grid gap-5 md:grid-cols-3"><label className="text-sm">Cover image URL<input value={story.cover_image} onChange={e=>setStory({...story,cover_image:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm">Tags<input value={story.tags} onChange={e=>setStory({...story,tags:e.target.value})} placeholder="horror, romance" className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm">Status<select value={story.status} onChange={e=>setStory({...story,status:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2"><option value="in_orbit">In Orbit</option><option value="complete">Complete</option><option value="hiatus">Hiatus</option></select></label></div><button disabled={saving} onClick={saveStory} className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm">Save Story</button></section>}

      {tab === "blogs" && <section className="rounded-xl border bg-card p-6 space-y-5"><h2 className="text-xl font-semibold">Blog Post</h2><div className="grid gap-5 md:grid-cols-2"><label className="text-sm">Blog ID (leave blank for new)<input value={blog.blog_id} onChange={e=>setBlog({...blog,blog_id:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm">Title<input value={blog.title} onChange={e=>setBlog({...blog,title:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label></div><label className="text-sm block">Excerpt<input value={blog.excerpt} onChange={e=>setBlog({...blog,excerpt:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><label className="text-sm block">Tags<input value={blog.tags} onChange={e=>setBlog({...blog,tags:e.target.value})} placeholder="character study, quick cut" className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label><textarea value={blog.content} onChange={e=>setBlog({...blog,content:e.target.value})} placeholder="Write or paste blog HTML..." className="min-h-[420px] w-full rounded-md border bg-background p-4 font-mono text-sm" /><div className="flex gap-3"><button disabled={saving} onClick={()=>saveBlog(false)} className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted">Save Draft</button><button disabled={saving} onClick={()=>saveBlog(true)} className="rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm">Publish</button></div></section>}
    </main>
  );
}
