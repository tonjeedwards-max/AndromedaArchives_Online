import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, Headphones, Loader2 } from "lucide-react";
import { requireSupabase } from "@/api/supabaseClient";
import PodcastPlayer from "@/components/podcasts/PodcastPlayer";

export default function PodcastDetail() {
  const { episodeId } = useParams();
  const supabase = requireSupabase();

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ["podcast", episodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title, description, audio_url, episode_number, cover_image, duration, tags, published, publish_date")
        .eq("id", episodeId)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(episodeId),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (error || !episode) {
    return (
      <div className="pt-24 max-w-3xl mx-auto px-6 text-center">
        <Headphones className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-light text-lg">Episode not found.</p>
        <Link to="/podcasts" className="text-primary hover:underline mt-4 inline-block">Back to podcasts</Link>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="pt-20 pb-4 max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/podcasts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All episodes
        </Link>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <PodcastPlayer episode={episode} />

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs text-accent uppercase tracking-wider font-medium mb-2">Episode details</p>
            <h2 className="font-heading text-xl font-semibold mb-3">About this episode</h2>
            {episode.description ? <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-line">{episode.description}</p> : <p className="text-muted-foreground/60 font-light italic">No description available.</p>}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {episode.publish_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(episode.publish_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>}
            {episode.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{episode.duration}</span>}
          </div>

          {episode.tags?.length > 0 && <div className="flex flex-wrap gap-2">{episode.tags.map((tag) => <span key={tag} className="text-xs px-3 py-1 rounded-full border border-accent/20 text-accent/80">{tag}</span>)}</div>}
        </div>
      </section>
    </div>
  );
}
