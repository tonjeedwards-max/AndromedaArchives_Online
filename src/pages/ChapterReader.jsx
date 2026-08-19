import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { requireSupabase } from "@/api/supabaseClient";
import MediaContent from "@/components/reader/MediaContent";
import ChapterActions from "@/components/reader/ChapterActions";
import ChapterCommentBox from "@/components/reader/ChapterCommentBox";
import { useReaderPrefs, getHistoryKey } from "@/hooks/useReaderPrefs";
import SEO from "@/components/SEO";

const renderers = { p: ({ children }) => <p className="mb-6 leading-[1.9]">{children}</p>, h2: ({ children }) => <h2 className="font-heading text-xl font-semibold mt-10 mb-4">{children}</h2>, h3: ({ children }) => <h3 className="font-heading text-lg font-semibold mt-8 mb-3">{children}</h3>, em: ({ children }) => <em className="italic opacity-80">{children}</em>, strong: ({ children }) => <strong className="font-semibold">{children}</strong>, a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{children}</a>, blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-5 my-6 italic opacity-70">{children}</blockquote>, hr: () => <div className="flex items-center justify-center gap-2 my-10"><div className="h-px w-12 bg-primary/30" /><div className="w-1.5 h-1.5 rounded-full bg-accent/60" /><div className="h-px w-12 bg-primary/30" /></div> };
const asArray = (value) => { if (Array.isArray(value)) return value.filter(Boolean); if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter(Boolean) : []; } catch { return []; } } return []; };

export default function ChapterReader() {
  const { storyCode, chapterId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const readerPrefs = useReaderPrefs();
  const { addToHistory, updateHistoryPosition, history } = readerPrefs;
  const chapterNumber = Number(chapterId);
  const nightMode = theme === "dark";
  const [fetchedContent, setFetchedContent] = useState(null);
  const restoredRef = useRef(null);
  const { data: story, isLoading: loadingStory } = useQuery({ queryKey: ["story-reader", storyCode], queryFn: async () => { const { data, error } = await requireSupabase().from("stories").select("*").eq("story_code", storyCode).eq("hidden", false).maybeSingle(); if (error) throw error; return data; }, enabled: Boolean(storyCode) });
  const { data: chapter, isLoading: loadingChapter, error: chapterError } = useQuery({ queryKey: ["chapter-reader", storyCode, chapterNumber, story?.id], queryFn: async () => { if (!story?.id || !Number.isInteger(chapterNumber)) return null; const { data, error } = await requireSupabase().from("chapters").select("id, story_id, chapter_number, title, content, media, word_count, published").eq("story_id", story.id).eq("chapter_number", chapterNumber).eq("published", true).maybeSingle(); if (error) throw error; return data; }, enabled: Boolean(story?.id) && Number.isInteger(chapterNumber) });
  const { data: allChapters = [] } = useQuery({ queryKey: ["story-reader-chapters", storyCode, story?.id], queryFn: async () => { if (!story?.id) return []; const { data, error } = await requireSupabase().from("chapters").select("id, chapter_number, title, published").eq("story_id", story.id).eq("published", true).order("chapter_number", { ascending: true }); if (error) throw error; return Array.isArray(data) ? data : []; }, enabled: Boolean(story?.id) });
  useEffect(() => { if (!chapter?.content || !/^https?:\/\//.test(chapter.content)) { setFetchedContent(null); return; } let cancelled = false; fetch(chapter.content).then((res) => { if (!res.ok) throw new Error("content_fetch_failed"); return res.text(); }).then((text) => { if (!cancelled) setFetchedContent(text); }).catch(() => { if (!cancelled) setFetchedContent(null); }); return () => { cancelled = true; }; }, [chapter?.content]);
  const displayContent = fetchedContent ?? chapter?.content ?? "";
  const currentIndex = useMemo(() => allChapters.findIndex((item) => Number(item.chapter_number) === chapterNumber), [allChapters, chapterNumber]);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const historyKey = story?.story_code && Number.isInteger(chapterNumber) ? getHistoryKey(story.story_code, chapterNumber) : null;

  useEffect(() => {
    if (!chapter || !story) return;
    addToHistory({ chapterId: chapter.id, chapterNumber: chapter.chapter_number, storyId: story.story_code, title: chapter.title, storyTitle: story.title, historyKey });
  }, [chapter?.id, story?.id, historyKey, addToHistory]);

  useEffect(() => {
    if (!chapter || !historyKey || restoredRef.current === historyKey) return;
    restoredRef.current = historyKey;
    const saved = history?.[historyKey];
    if (saved?.scrollPct > 0) window.setTimeout(() => { const max = document.documentElement.scrollHeight - window.innerHeight; if (max > 0) window.scrollTo(0, saved.scrollPct * max); }, 500);
  }, [chapter?.id, historyKey, history]);

  useEffect(() => {
    const onScroll = () => {
      if (!chapter || !story || !historyKey) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) updateHistoryPosition(chapter.chapter_number, { scrollPct: Math.min(1, window.scrollY / max) }, story.story_code);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapter?.chapter_number, story?.story_code, historyKey, updateHistoryPosition]);

  if (loadingStory || loadingChapter) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (chapterError || !story || !chapter) return <div className="max-w-3xl mx-auto px-6 py-20 text-center"><BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground text-lg">Chapter not found.</p><p className="text-xs text-muted-foreground mt-2">{storyCode} · Chapter {chapterNumber}</p><Link to={`/story/${storyCode}`} className="text-accent hover:underline mt-4 inline-block text-sm">← Back to story</Link></div>;
  const goToChapter = (target) => { if (target) navigate(`/story/${story.story_code}/chapter/${target.chapter_number}`); };

  return <>
    <SEO title={`${story.title} — Chapter ${chapter.chapter_number}: ${chapter.title}`} description={`Read Chapter ${chapter.chapter_number}, “${chapter.title},” from ${story.title} on The Andromeda Archive.`} path={`/story/${story.story_code}/chapter/${chapter.chapter_number}`} type="article" image={story.cover_image} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Stories", path: "/stories" }, { name: story.title, path: `/story/${story.story_code}` }, { name: `Chapter ${chapter.chapter_number}`, path: `/story/${story.story_code}/chapter/${chapter.chapter_number}` }]} structuredData={{ "@type": "Chapter", name: chapter.title, isPartOf: { "@type": "Book", name: story.title, url: `https://andromedaarchiveonline.netlify.app/story/${story.story_code}` }, position: chapter.chapter_number, wordCount: chapter.word_count ? Number(chapter.word_count) : undefined, url: `https://andromedaarchiveonline.netlify.app/story/${story.story_code}/chapter/${chapter.chapter_number}` }} />
    <div className={`relative z-10 min-h-screen ${nightMode ? "bg-[#111] text-[#e8e8e8]" : "bg-background text-foreground"}`}>
      <div className="sticky top-0 z-20 border-b border-border/30 bg-background/85 backdrop-blur-sm"><div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3"><Link to={`/story/${story.story_code}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0"><ArrowLeft className="w-4 h-4 shrink-0" /><span className="truncate">{story.title}</span></Link><span className="text-xs text-muted-foreground font-medium shrink-0">Ch. {chapter.chapter_number}</span><div className="flex items-center gap-2 shrink-0"><ChapterActions chapterId={chapter.id} storyId={story.story_code} chapterTitle={chapter.title} storyTitle={story.title} nightMode={nightMode} readerPrefs={readerPrefs} />{previousChapter && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToChapter(previousChapter)} title="Previous chapter"><ChevronLeft className="w-4 h-4" /></Button>}{nextChapter && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToChapter(nextChapter)} title="Next chapter"><ChevronRight className="w-4 h-4" /></Button>}</div></div></div>
      <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-3xl mx-auto px-6 pt-8 pb-12 sm:pt-10 sm:pb-16"><header className="mb-10 text-center"><p className="text-xs text-accent uppercase tracking-[0.3em] mb-3 font-medium">{story.title} · Chapter {chapter.chapter_number}</p><h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">{chapter.title}</h1>{chapter.word_count && <p className="text-xs text-muted-foreground mt-3">{Number(chapter.word_count).toLocaleString()} words</p>}</header><div className="prose prose-invert max-w-none text-[1.03rem]"><MediaContent content={displayContent} media={asArray(chapter.media)} renderers={renderers} /></div><div className="mt-14 pt-6 border-t border-border/30 flex items-center justify-between gap-4">{previousChapter ? <Button variant="outline" onClick={() => goToChapter(previousChapter)}><ChevronLeft className="w-4 h-4 mr-1" />Chapter {previousChapter.chapter_number}</Button> : <span />}{nextChapter ? <Button onClick={() => goToChapter(nextChapter)}>Chapter {nextChapter.chapter_number}<ChevronRight className="w-4 h-4 ml-1" /></Button> : <span />}</div><ChapterCommentBox chapterId={chapter.id} chapterNumber={chapter.chapter_number} chapterTitle={chapter.title} /></motion.article>
    </div>
  </>;
}
