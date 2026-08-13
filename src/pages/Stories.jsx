import React, { useState, useMemo, useEffect } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import StoryCoverCard from "@/components/stories/StoryCoverCard";
import StoryFilter from "@/components/stories/StoryFilter";
import SectionHeading from "@/components/shared/SectionHeading";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(12);
  useEffect(() => {
    const updatePageSize = () => setItemsPerPage(window.innerWidth >= 1024 ? 12 : 6);
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const { data: stories = [], isLoading } = useQuery({
  queryKey: ["stories"],
  queryFn: async () => {
    const { data, error } = await requireSupabase()
      .from("stories")
      .select("*")
      .eq("hidden", false)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
});

  const toggleFilter = (item) => {
    setSelectedFilters((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
    setCurrentPage(1);
  };

  const toggleStatus = (value) => {
    setSelectedStatus((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return stories
      .filter((story) => !story.hidden)
      .filter((story) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          story.title?.toLowerCase().includes(q) ||
          story.synopsis?.toLowerCase().includes(q) ||
          story.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesFilter =
          selectedFilters.length === 0 ||
          selectedFilters.some((f) =>
            story.tags?.some((t) => t.toLowerCase() === f.toLowerCase())
          );
        const matchesStatus =
          selectedStatus.length === 0 || selectedStatus.includes(story.status);
        return matchesSearch && matchesFilter && matchesStatus;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [stories, searchQuery, selectedFilters, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const clampedPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedStories = filtered.slice(
    (clampedPage - 1) * itemsPerPage,
    clampedPage * itemsPerPage
  );

  return (
    <div className="relative z-10">
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          title="Story Catalogue"
          subtitle="Choose your next adventure among the stars"
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Filter sidebar — left */}
          <aside className="md:w-60 lg:w-64 shrink-0">
            <div className="md:sticky md:top-20 bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h3 className="text-sm font-heading font-semibold mb-4 text-foreground/80">Search & Filter</h3>
              <StoryFilter
                searchQuery={searchQuery}
                onSearchChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                selectedFilters={selectedFilters}
                onToggleFilter={toggleFilter}
                selectedStatus={selectedStatus}
                onToggleStatus={toggleStatus}
                onClear={() => { setSelectedFilters([]); setSelectedStatus([]); setCurrentPage(1); }}
              />
            </div>
          </aside>

          {/* Stories grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : paginatedStories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-light text-lg">
                  No stories found. Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedStories.map((story, i) => (
                    <StoryCoverCard key={story.id} story={story} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={clampedPage === 1}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <span className="text-sm text-muted-foreground font-medium">
                      {clampedPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={clampedPage === totalPages}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
