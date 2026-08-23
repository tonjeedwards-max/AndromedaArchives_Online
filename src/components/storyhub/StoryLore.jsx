import React from "react";
import { BookMarked, ChevronDown } from "lucide-react";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function StoryLore({ entries = [] }) {
  const grouped = entries.reduce((groups, entry) => {
    const category = entry.category?.trim() || "Lore";
    if (!groups[category]) groups[category] = [];
    groups[category].push(entry);
    return groups;
  }, {});

  const categories = Object.entries(grouped);

  if (!categories.length) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/40 p-8 text-center">
        <BookMarked className="mx-auto w-8 h-8 text-accent/70 mb-3" />
        <p className="font-medium">The lore archive is still being written.</p>
        <p className="text-sm text-muted-foreground mt-1">Check back later for worldbuilding notes, glossaries, and other story secrets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
        <div className="flex items-center gap-3">
          <BookMarked className="w-5 h-5 text-accent" />
          <div>
            <h2 className="font-heading text-lg font-semibold">Lore & Reference</h2>
            <p className="text-sm text-muted-foreground">A spoiler-aware reference guide for this story's world.</p>
          </div>
        </div>
      </div>

      {categories.map(([category, categoryEntries]) => (
        <section key={category} className="space-y-3">
          <h3 className="font-heading text-xl font-semibold">{category}</h3>
          <div className="space-y-2">
            {categoryEntries.map((entry, index) => (
              <details key={entry.id} className="group rounded-lg border border-border/40 bg-card/50 overflow-hidden" open={index === 0 && categoryEntries.length === 1}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                  <span>{entry.title}</span>
                  <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border/30 px-4 py-4 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }} />
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
