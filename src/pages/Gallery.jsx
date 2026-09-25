import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { requireSupabase } from "@/api/supabaseClient";
import SectionHeading from "@/components/shared/SectionHeading";
import GalleryFilter from "@/components/gallery/GalleryFilter";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
};

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("gallery_items")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (Array.isArray(data) ? data : []).map((item) => ({ ...item, tags: asArray(item.tags) }));
    },
  });

  const galleryItems = Array.isArray(galleryData) ? galleryData : [];

  const toggleFilter = (item) => {
    setSelectedFilters((prev) => prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return galleryItems.filter((item) => {
      const tags = asArray(item.tags);
      const matchesSearch = !q || item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || tags.some((tag) => String(tag).toLowerCase().includes(q));
      const matchesFilter = selectedFilters.length === 0 || selectedFilters.some((filter) => tags.some((tag) => String(tag).toLowerCase() === filter.toLowerCase()));
      return matchesSearch && matchesFilter;
    });
  }, [galleryItems, searchQuery, selectedFilters]);

  return (
    <div className="relative z-10">
      <div className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading title="Gallery" subtitle="a collection of drawings from the archives" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <aside className="md:w-60 lg:w-64 shrink-0">
            <div className="md:sticky md:top-20 bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4">
              <h3 className="text-sm font-heading font-semibold mb-4 text-foreground/80">Search & Filter</h3>
              <GalleryFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedFilters={selectedFilters}
                onToggleFilter={toggleFilter}
                onClear={() => { setSelectedFilters([]); setSearchQuery(""); }}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground font-light text-lg">No drawings found. Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                {filtered.map((item, index) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    onClick={() => setSelectedItem(item)}
                    className="group relative block w-full text-left mb-5 break-inside-avoid overflow-hidden rounded-xl border border-border/30 bg-card/40 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                  >
                    <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]" />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                      {item.description && <p className="text-xs text-white/75 mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedItem && (
          <motion.div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)}>
            <motion.div className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <img src={selectedItem.image_url} alt={selectedItem.title} className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl" />
              <button type="button" onClick={() => setSelectedItem(null)} aria-label="Close artwork" className="absolute -top-2 -right-2 sm:top-0 sm:-right-12 w-9 h-9 rounded-full bg-background/90 text-foreground flex items-center justify-center hover:bg-background transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute left-0 right-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">
                <h2 className="text-lg font-heading font-semibold text-white">{selectedItem.title}</h2>
                {selectedItem.description && <p className="text-sm text-white/75 mt-1 max-w-2xl">{selectedItem.description}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
