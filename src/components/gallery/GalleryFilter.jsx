import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const FILTER_GROUPS = [
  { name: "Art Style", items: ["Character Design", "Concept Art", "Fan Art", "Illustration"] },
  { name: "Medium", items: ["Digital", "Traditional", "Sketch", "Commission"] },
];

export default function GalleryFilter({ searchQuery, onSearchChange, selectedFilters, onToggleFilter, onClear }) {
  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search drawings..." className="pl-9" />
      </div>
      {FILTER_GROUPS.map((group) => (
        <div key={group.name}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 font-heading">{group.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => {
              const active = selectedFilters.includes(item);
              return (
                <button key={item} onClick={() => onToggleFilter(item)} className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 ${active ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20" : "bg-transparent text-foreground/60 border-border hover:border-primary/40 hover:text-foreground/90"}`}>
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selectedFilters.length > 0 && (
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
          <X className="w-3 h-3" /> Clear filters
        </button>
      )}
    </div>
  );
}
