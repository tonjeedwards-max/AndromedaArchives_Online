import React from "react";
import { BookMarked, ChevronDown, ExternalLink } from "lucide-react";
import { sanitizeChapterHtml } from "@/lib/htmlContent";

const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

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

  if (!categories.length) return null;

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
            {categoryEntries.map((entry, index) => {
              const content = String(entry.content || "").trim();
              const externalReference = isHttpUrl(content);

              return (
                <details key={entry.id} className="group rounded-lg border border-border/40 bg-card/50 overflow-hidden" open={index === 0 && categoryEntries.length === 1}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{entry.title}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border/30 px-4 py-4">
                    {externalReference ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                          <span>Reference page</span>
                          <a href={content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                            Open separately <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <iframe
                          src={content}
                          title={entry.title || "Lore reference"}
                          className="w-full min-h-[70vh] rounded-lg border border-border/40 bg-background"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeChapterHtml(content) }}
                      />
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
