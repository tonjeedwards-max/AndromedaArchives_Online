import React from "react";
import { useParams, Link } from "react-router-dom";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, MessageCircle, Loader2 } from "lucide-react";
import ChapterList from "@/components/storyhub/ChapterList";
import StoryCommentBox from "@/components/storyhub/StoryCommentBox";
import StoryRating from "@/components/storyhub/StoryRating";
import { getStatusInfo } from "@/lib/storyStatus";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
  return [];
};

export default function StoryHub() {
  const { storyCode } = useParams();
  const { data: story, isLoading: loadingStory } = useQuery({
    queryKey: ["story", storyCode],
    queryFn: async () => {
      if (!storyCode) return null;
      const { data, error } = await requireSupabase().from("stories").select("*").eq("story_code", storyCode).maybeSingle();
      if (error) throw error;
      return data ? { ...data, tags: asArray(data.tags) } : null;
    },
    enabled: Boolean(storyCode),
  });
  const { data: chapters = [], isLoading: loadingChapters } = useQuery({
    queryKey: ["chapters", storyCode, story?.id],
    queryFn: async () => {
      if (!story?.id) return [];
      const { data, error } = await requireSupabase().from("chapters").select("*").eq("story_id", story.id).eq("published", true).order("chapter_number", { ascending: true });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(story?.id),
    initialData: [],
  });
  if (loadingStory) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!story) return <div className="max-w-3xl mx-auto px-6 py-20 text-center"><p className="text-muted-foreground text-lg">Story not found in this corner of the cosmos.</p><Link to="/stories" className="text-accent hover:underline mt-4 inline-block text-sm">← Back to catalogue</Link></div>;
  return (
    <div className="relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-4">
        <Link to="/stories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"><ArrowLeft className="w-4 h-4" />Back to Catalogue</Link>
        <div className="flex flex-col md:flex-row gap-8">
          {story.cover_image && <div className="w-40 md:w-48 shrink-0 mx-auto md:mx-0"><div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl shadow-primary/15 ring-1 ring-border/40 relative"><img src={story.cover_image} alt={story.title} className="w-full h-full object-cover" /><div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent/60 via-primary/40 to-accent/60" /></div></div>}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {story.status && <Badge variant="outline" className={`text-xs border ${getStatusInfo(story.status).badgeClass}`}>{getStatusInfo(story.status).label}</Badge>}
              {asArray(story.tags).slice().sort((a, b) => String(a).localeCompare(String(b))).slice(0, 3).map((tag) => <Badge key={tag} variant="outline" className="text-xs border-accent/30 text-accent capitalize">{tag}</Badge>)}
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-4">{story.title}</h1>
            {story.synopsis && <p className="text-foreground/70 leading-relaxed font-light max-w-2xl">{story.synopsis}</p>}
            <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground"><span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{chapters.length} chapter{chapters.length !== 1 ? "s" : ""}</span></div>
            <StoryRating storyId={story.id} />
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="bg-card/60 border border-border/40 mb-6"><TabsTrigger value="chapters" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><BookOpen className="w-3.5 h-3.5" />Chapters</TabsTrigger><TabsTrigger value="comments" className="gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><MessageCircle className="w-3.5 h-3.5" />Comments</TabsTrigger></TabsList>
          <TabsContent value="chapters">{loadingChapters ? <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : <ChapterList chapters={chapters} storyId={storyCode} />}</TabsContent>
          <TabsContent value="comments"><StoryCommentBox storyId={story.id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
