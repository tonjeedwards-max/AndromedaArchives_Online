import React, { useEffect, useState } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, Save, Trash2, BookMarked, RefreshCw } from "lucide-react";
import { sanitizeChapterHtml } from "@/lib/htmlContent";

const emptyEntry = { id: "", story_id: "", category: "Lore", title: "", content: "", sort_order: 0, published: true };

export default function AdminLore() {
  const { user, isAdmin } = useAuth();
  const supabase = requireSupabase();
  const [stories, setStories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [entry, setEntry] = useState(emptyEntry);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const [{ data: storyData, error: storyError }, { data: loreData, error: loreError }] = await Promise.all([
      supabase.from("stories").select("id,story_code,title").order("title"),
      supabase.from("story_lore_entries").select("id,story_id,category,title,content,sort_order,published,updated_at,stories(story_code,title)").order("updated_at", { ascending: false }),
    ]);
    if (storyError) setError(storyError.message);
    if (loreError) setError(loreError.message);
    setStories(storyData || []);
    setEntries(loreData || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const save = async () => {
    setSaving(true); setMessage(""); setError("");
    try {
      if (!entry.story_id || !entry.title.trim()) throw new Error("Story and lore entry title are required.");
      const safe = sanitizeChapterHtml(entry.content || "");
      const payload = {
        ...(entry.id ? { id: Number(entry.id) } : {}),
        story_id: Number(entry.story_id),
        category: entry.category.trim() || "Lore",
        title: entry.title.trim(),
        content: safe,
        sort_order: Number(entry.sort_order) || 0,
        published: Boolean(entry.published),
        updated_at: new Date().toISOString(),
      };
      const { error: saveError } = await supabase.from("story_lore_entries").upsert(payload, { onConflict: "id" });
      if (saveError) throw saveError;
      setEntry(emptyEntry);
      setMessage("Lore entry saved.");
      await load();
    } catch (err) { setError(err.message || "Unable to save lore entry."); }
    finally { setSaving(false); }
  };

  const edit = (item) => setEntry({ id: item.id, story_id: String(item.story_id), category: item.category || "Lore", title: item.title || "", content: item.content || "", sort_order: item.sort_order || 0, published: item.published });

  const remove = async (id) => {
    if (!window.confirm("Delete this lore entry?")) return;
    setError(""); setMessage("");
    const { error: deleteError } = await supabase.from("story_lore_entries").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { setMessage("Lore entry deleted."); await load(); }
  };

  if (!isAdmin) return <main className="max-w-3xl mx-auto px-6 py-20 text-center"><h1 className="text-2xl font-semibold">Lore Manager</h1><p className="mt-3 text-muted-foreground">Admin access is required.</p>{user?.email && <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>}</main>;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2"><BookMarked className="w-6 h-6 text-accent" /><h1 className="text-3xl font-semibold tracking-tight">Lore Manager</h1></div><p className="mt-2 text-muted-foreground">Build story-specific glossaries, character notes, magic systems, timelines, factions, and other reference material.</p></div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>
      {message && <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">{message}</div>}
      {error && <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</div>}

      <section className="rounded-xl border bg-card p-6 space-y-5 mb-8">
        <h2 className="text-xl font-semibold">{entry.id ? "Edit Lore Entry" : "New Lore Entry"}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm">Story<select value={entry.story_id} onChange={e=>setEntry({...entry,story_id:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2"><option value="">Select a story</option>{stories.map(story=><option key={story.id} value={story.id}>{story.title} ({story.story_code})</option>)}</select></label>
          <label className="text-sm">Category<input value={entry.category} onChange={e=>setEntry({...entry,category:e.target.value})} placeholder="Glossary, Characters, Magic, Factions..." className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label>
        </div>
        <div className="grid gap-5 md:grid-cols-[1fr_140px]">
          <label className="text-sm">Entry title<input value={entry.title} onChange={e=>setEntry({...entry,title:e.target.value})} placeholder="The Archons" className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm">Order<input type="number" value={entry.sort_order} onChange={e=>setEntry({...entry,sort_order:e.target.value})} className="mt-2 w-full rounded-md border bg-background px-3 py-2" /></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entry.published} onChange={e=>setEntry({...entry,published:e.target.checked})} />Visible to readers</label>
        <label className="text-sm block">Content<textarea value={entry.content} onChange={e=>setEntry({...entry,content:e.target.value})} placeholder="HTML is supported. Use headings, paragraphs, lists, links, etc." className="mt-2 min-h-[300px] w-full rounded-md border bg-background p-4 font-mono text-sm" /></label>
        <div className="flex gap-3"><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}{entry.id ? "Update Entry" : "Save Entry"}</button>{entry.id && <button onClick={()=>setEntry(emptyEntry)} className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted">Cancel</button>}</div>
      </section>

      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40"><h2 className="font-semibold">Existing Entries</h2></div>
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : entries.length === 0 ? <p className="p-8 text-sm text-muted-foreground">No lore entries yet.</p> : <div className="divide-y divide-border/40">{entries.map(item=><div key={item.id} className="p-5 flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="text-xs uppercase tracking-wide text-accent">{item.category}</span>{!item.published && <span className="text-xs text-muted-foreground">Draft</span>}</div><h3 className="font-medium mt-1">{item.title}</h3><p className="text-sm text-muted-foreground mt-1">{item.stories?.title || "Unknown story"}</p></div><div className="flex gap-2 shrink-0"><button onClick={()=>edit(item)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Edit</button><button onClick={()=>remove(item.id)} className="rounded-md border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>}
      </section>
    </main>
  );
}
