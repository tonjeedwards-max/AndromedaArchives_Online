import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MediaContent from "@/components/reader/MediaContent";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, BookOpen, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import CommentBox from "@/components/reader/CommentBox";
import ChapterActions from "@/components/reader/ChapterActions";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { useTheme } from "next-themes";

// Page turn animation variants — right to left (manga style)
const pageVariants = {
  enterFromLeft: { rotateY: -90, opacity: 0, originX: "100%" },
  enterFromRight: { rotateY: 90, opacity: 0, originX: "0%" },
  center: { rotateY: 0, opacity: 1 },
  exitToLeft: { rotateY: 90, opacity: 0, originX: "100%" },
  exitToRight: { rotateY: -90, opacity: 0, originX: "0%" },
};

export default function ChapterReader() {
  const { storyCode, chapterId } = useParams();
  const navigate = useNavigate();
  const readerPrefs = useReaderPrefs();
  const { addToHistory, updateHistoryPosition, history } = readerPrefs;
  const { theme } = useTheme();
  const nightMode = theme === "dark";
  const [viewMode, setViewMode] = useState("text"); // "text" | "manga"
  const [mangaPage, setMangaPage] = useState(0);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [isAnimating, setIsAnimating] = useState(false);
  const [fetchedContent, setFetchedContent] = useState(null);

  const chapterNumber = Number(chapterId);

  const { data: chapter, isLoading: loadingChapter } = useQuery({
    queryKey: ["chapter", storyCode, chapterNumber],
    queryFn: async () => {
      if (!storyCode || !Number.isInteger(chapterNumber)) return null;
      const chapters = await base44.entities.Chapter.filter({
        story_id: storyCode,
        chapter_number: chapterNumber,
        published: true,
      });
      return chapters[0] || null;
    },
    enabled: Boolean(storyCode) && Number.isInteger(chapterNumber),
  });

  const { data: allChapters } = useQuery({
    queryKey: ["story-chapters", storyCode],
    queryFn: () => base44.entities.Chapter.filter({ story_id: storyCode, published: true }, "chapter_number"),
    initialData: [],
  });

  const { data: story } = useQuery({
    queryKey: ["story-name", storyCode],
    queryFn: async () => {
      const stories = await base44.entities.Story.filter({ story_code: storyCode });
      return stories[0] || null;
    },
  });

  // Track reading history when chapter + story load
  useEffect(() => {
    if (chapter && story) {
      addToHistory({
        chapterId: chapter.chapter_number,
        storyId: storyCode,
        title: chapter.title,
        chapterNumber: chapter.chapter_number,
        storyTitle: story.title,
      });
    }
  }, [chapter?.chapter_number, story?.id, storyCode, addToHistory]);

  // Fetch content if it's a file URL (large chapters are stored as files)
  useEffect(() => {
    if (chapter?.content && /^https?:\/\//.test(chapter.content)) {
      fetch(chapter.content)
        .then((res) => res.text())
        .then((text) => setFetchedContent(text))
        .catch(() => setFetchedContent(null));
    } else {
      setFetchedContent(null);
    }
  }, [chapter?.content]);

  const displayContent = fetchedContent || chapter?.content || "";

  // Restore the reader's last position once per chapter (scroll for text, page for manga)
  const restoredRef = useRef(null);
  useEffect(() => {
    if (!chapter || restoredRef.current === chapterId) return;
    const saved = history?.[chapterId];
    restoredRef.current = chapterId;
    if (!saved) return;
    const contentHasManga = displayContent && /!\[|<img/i.test(displayContent);
    if (saved.mangaPage != null && contentHasManga) {
      setViewMode("manga");
      setMangaPage(saved.mangaPage);
      return;
    }
    if (saved.scrollPct != null && saved.scrollPct > 0) {
      setTimeout(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0) window.scrollTo(0, saved.scrollPct * max);
      }, 700);
    }
  }, [chapter?.id, chapterId, displayContent, history]);

  // Track text-view scroll position (throttled)
  const scrollTimerRef = useRef(null);
  useEffect(() => {
    if (viewMode !== "text") return;
    const onScroll = () => {
      if (scrollTimerRef.current) return;
      scrollTimerRef.current = setTimeout(() => {
        scrollTimerRef.current = null;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        updateHistoryPosition(chapterId, { scrollPct: Math.min(1, window.scrollY / max) });
      }, 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) { clearTimeout(scrollTimerRef.current); scrollTimerRef.current = null; }
    };
  }, [viewMode, chapterId, updateHistoryPosition]);

  // Track manga page position
  useEffect(() => {
    if (viewMode === "manga" && chapterId) {
      updateHistoryPosition(chapterId, { mangaPage });
    }
  }, [mangaPage, viewMode, chapterId, updateHistoryPosition]);

  if (loadingChapter) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground text-lg">Chapter not found.</p>
        <Link to={`/story/${storyCode}`} className="text-accent hover:underline mt-4 inline-block text-sm">
          ← Back to story
        </Link>
      </div>
    );
  }

  const currentIndex = allChapters.findIndex(
    (c) => Number(c.chapter_number) === chapterNumber
  );
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Parse illustration pages — from markdown ![]() or HTML <img> tags
  const illustrationPages = displayContent
    ? [
        ...displayContent
          .split("\n")
          .filter((line) => line.trim().startsWith("!["))
          .map((line) => {
            const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
            return match ? { alt: match[1], src: match[2] } : null;
          })
          .filter(Boolean),
        ...(displayContent.match(/<img[^>]+src=["'][^"']+["'][^>]*>/gi) || [])
          .map((tag) => {
            const srcMatch = tag.match(/src=["']([^"']+)["']/i);
            const altMatch = tag.match(/alt=["']([^"']*)["']/i);
            return srcMatch ? { src: srcMatch[1], alt: altMatch?.[1] || "" } : null;
          })
          .filter(Boolean),
      ]
    : [];

  const hasManga = illustrationPages.length > 0;

  const goToMangaPage = (dir) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    if (dir === "next") {
      setMangaPage((p) => Math.min(p + 1, illustrationPages.length - 1));
    } else {
      setMangaPage((p) => Math.max(p - 1, 0));
    }
    setTimeout(() => setIsAnimating(false), 400);
  };

  const navigateChapter = (ch, dir) => {
    if (dir === "next") {
      base44.analytics.track({
        eventName: "chapter_completion",
        properties: { storyCode, chapterId, chapterNumber: chapter?.chapter_number },
      });
    }
    setDirection(dir);
    setMangaPage(0);
    navigate(`/story/${storyCode}/chapter/${ch.chapter_number}`);
  };

  // Reader bg/text classes based on night mode
  const readerBg = nightMode ? "bg-[#111111]" : "bg-white";
  const readerText = nightMode ? "text-[#e8e8e8]" : "text-[#1a1a1a]";

  const markdownRenderers = {
    p: ({ children }) => <p className="mb-6 leading-[1.9]">{children}</p>,
    h2: ({ children }) => <h2 className={`font-heading text-xl font-semibold mt-10 mb-4 ${nightMode ? "text-white" : "text-gray-900"}`}>{children}</h2>,
    h3: ({ children }) => <h3 className={`font-heading text-lg font-semibold mt-8 mb-3 ${nightMode ? "text-white" : "text-gray-900"}`}>{children}</h3>,
    em: ({ children }) => <em className="italic opacity-70">{children}</em>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-purple-400/50 pl-5 my-6 italic opacity-60">{children}</blockquote>
    ),
    hr: () => (
      <div className="flex items-center justify-center gap-2 my-10">
        <div className="h-px w-12 bg-purple-400/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
        <div className="h-px w-12 bg-purple-400/30" />
      </div>
    ),
    img: ({ src, alt }) => (
      <figure className="my-8 text-center">
        <img src={src} alt={alt} className="mx-auto rounded-lg max-w-full shadow-md" />
        {alt && <figcaption className="text-xs mt-2 opacity-50">{alt}</figcaption>}
      </figure>
    ),
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* Top bar */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            to={`/story/${storyCode}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{story?.title || "Back"}</span>
          </Link>

          <span className="text-xs text-muted-foreground font-medium">
            Ch. {chapter.chapter_number}
          </span>

          <div className="flex items-center gap-2">
            {/* Bookmark / Favourite */}
            {chapter && story && (
              <ChapterActions
                chapterId={chapterId}
                storyId={storyCode}
                chapterTitle={chapter.title}
                storyTitle={story?.title}
                nightMode={nightMode}
                readerPrefs={readerPrefs}
              />
            )}

            {/* Mode toggle: text / manga */}
            {hasManga && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode(viewMode === "text" ? "manga" : "text")}
                title={viewMode === "text" ? "Switch to Manga View" : "Switch to Text View"}
              >
                {viewMode === "text" ? <Image className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </Button>
            )}

            {/* Chapter prev/next */}
            {prevChapter && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateChapter(prevChapter, "prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {nextChapter && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateChapter(nextChapter, "next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MANGA VIEW */}
      {viewMode === "manga" && hasManga ? (
        <div className="max-w-2xl mx-auto px-4 py-10">
          <header className="mb-6 text-center">
            <p className="text-xs text-accent uppercase tracking-[0.3em] mb-2 font-medium">
              Chapter {chapter.chapter_number}
            </p>
            <h1 className="font-heading text-2xl md:text-3xl font-semibold">{chapter.title}</h1>
            <p className="text-xs text-muted-foreground mt-2">
              Page {mangaPage + 1} / {illustrationPages.length} · Read right to left
            </p>
          </header>

          {/* Page viewer — right-to-left manga */}
          <div
            className="relative overflow-hidden rounded-xl border border-border/30 bg-black shadow-2xl shadow-primary/10"
            style={{ perspective: "1200px" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mangaPage}
                initial={direction === "next" ? pageVariants.enterFromLeft : pageVariants.enterFromRight}
                animate={pageVariants.center}
                exit={direction === "next" ? pageVariants.exitToLeft : pageVariants.exitToRight}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={illustrationPages[mangaPage].src}
                  alt={illustrationPages[mangaPage].alt || `Page ${mangaPage + 1}`}
                  className="w-full h-auto block"
                  style={{ maxHeight: "80vh", objectFit: "contain", margin: "0 auto" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Left tap zone (go forward in manga = next page) */}
            <button
              onClick={() => goToMangaPage("next")}
              disabled={mangaPage >= illustrationPages.length - 1}
              className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity disabled:hidden"
            >
              <div className="bg-black/40 rounded-full p-2">
                <ChevronLeft className="w-6 h-6 text-white" />
              </div>
            </button>

            {/* Right tap zone (go back in manga = previous page) */}
            <button
              onClick={() => goToMangaPage("prev")}
              disabled={mangaPage <= 0}
              className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity disabled:hidden"
            >
              <div className="bg-black/40 rounded-full p-2">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {illustrationPages.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > mangaPage ? "next" : "prev"); setMangaPage(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === mangaPage ? "bg-accent scale-125" : "bg-border/60 hover:bg-primary/50"}`}
              />
            ))}
          </div>

          {/* Switch to text */}
          <div className="text-center mt-6">
            <button
              onClick={() => setViewMode("text")}
              className="text-xs text-muted-foreground hover:text-accent transition-colors underline underline-offset-2"
            >
              Switch to text reading mode
            </button>
          </div>
        </div>
      ) : (
        /* TEXT VIEW with page-turn chapter nav */
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={chapterId}
            initial={direction === "next" ? { rotateY: -8, opacity: 0, x: 40 } : { rotateY: 8, opacity: 0, x: -40 }}
            animate={{ rotateY: 0, opacity: 1, x: 0 }}
            exit={direction === "next" ? { rotateY: 8, opacity: 0, x: -40 } : { rotateY: -8, opacity: 0, x: 40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`max-w-2xl mx-auto px-6 py-12 rounded-xl my-6 shadow-lg ${readerBg} ${readerText}`}
          >
            <header className="mb-10 text-center">
              <p className={`text-xs uppercase tracking-[0.3em] mb-3 font-medium ${nightMode ? "text-purple-400" : "text-purple-600"}`}>
                Chapter {chapter.chapter_number}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
                {chapter.title}
              </h1>
              {chapter.word_count && (
                <p className={`text-xs mt-4 ${nightMode ? "text-gray-500" : "text-gray-400"}`}>
                  {chapter.word_count.toLocaleString()} words · ~{Math.ceil(chapter.word_count / 250)} min read
                </p>
              )}
            </header>

            <div className="reader-content font-light text-[1.05rem] leading-[1.9]">
              <MediaContent
                content={displayContent}
                media={chapter.media || []}
                renderers={markdownRenderers}
              />
            </div>

            {/* Bottom nav */}
            <div className={`flex items-center justify-between mt-16 pt-8 border-t ${nightMode ? "border-white/10" : "border-gray-200"}`}>
              {prevChapter ? (
                <button
                  onClick={() => navigateChapter(prevChapter, "prev")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${nightMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              ) : <div />}

              <Link
                to={`/story/${storyCode}`}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors ${nightMode ? "border-white/20 text-gray-400 hover:text-white hover:border-white/40" : "border-gray-300 text-gray-500 hover:text-gray-900"}`}
              >
                All Chapters
              </Link>

              {nextChapter ? (
                <button
                  onClick={() => navigateChapter(nextChapter, "next")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${nightMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : <div />}
            </div>

            <CommentBox chapterId={chapterId} nightMode={nightMode} />
          </motion.article>
        </AnimatePresence>
      )}
    </div>
  );
}
