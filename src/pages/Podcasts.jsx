import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Podcast as PodcastIcon } from "lucide-react";
import { requireSupabase } from "@/api/supabaseClient";
import PodcastFilter from "@/components/podcasts/PodcastFilter";
import SectionHeading from "@/components/shared/SectionHeading";

export default function Podcasts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const supabase = requireSupabase();

  const { data: episodes = [], isLoading, error } = useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title, description, audio_url, episode_number, cover_image, duration, tags, published, publish_date")
        .eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });

  const toggleFilter = (item) => {
    setSelectedFilters((prev) => prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return episodes.filter((ep) => {
      const tags = Array.isArray(ep.tags) ? ep.tags : [];
      const matchesSearch = !q || ep.title?.toLowerCase().includes(q) || ep.description?.toLowerCase().includes(q);
      const matchesFilter = selectedFilters.length === 0 || selectedFilters.some((f) => tags.some((t) => String(t).toLowerCase() === f.toLowerCase()));
      return matchesSearch && matchesFilter;
    });
  }, [episodes, searchQuery, selectedFilters]);

  return (
    <div className="relative z-10">
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading title="Podcasts" subtitle="audio broadcasts from the Andromeda archives" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <aside className="md:w-60 lg:w-64 shrink-0">
            <div className="md:sticky md:top-20 bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h3 className="text-sm font-heading font-semibold mb-4 text-foreground/80">Search & Filter</h3>
              <PodcastFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedFilters={selectedFilters} onToggleFilter={toggleFilter} onClear={() => setSelectedFilters([])} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">We couldn't load the podcast archive right now. Please refresh and try again.</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <PodcastIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-light text-lg">No episodes found. Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {filtered.map((ep) => (
                  <Link key={ep.id} to={`/podcasts/${ep.id}`} className="block rounded-xl border border-border/30 bg-card/60 p-5 shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                    <div className="flex gap-4">
                      {ep.cover_image ? (
                        <img src={ep.cover_image} alt={ep.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
                          <PodcastIcon className="w-8 h-8 text-accent" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {ep.episode_number != null && <p className="text-xs text-accent uppercase tracking-wider font-medium mb-1">Episode {ep.episode_number}</p>}
                        <h3 className="font-heading text-lg font-semibold">{ep.title}</h3>
                        {ep.description && <p className="text-sm text-muted-foreground font-light mt-1 line-clamp-2">{ep.description}</p>}
                        {ep.tags?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{ep.tags.map((tag) => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-accent/20 text-accent/80">{tag}</span>)}</div>}
                      </div>
                      {ep.duration && <span className="text-xs text-muted-foreground shrink-0 self-start">{ep.duration}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
