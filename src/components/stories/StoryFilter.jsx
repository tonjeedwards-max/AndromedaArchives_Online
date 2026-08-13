import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATUS_FILTERS = [
  { label: "Completed", value: "in_orbit", cosmic: "IN ORBIT" },
  { label: "Hiatus", value: "lost_in_space", cosmic: "LOST IN SPACE" },
  { label: "Ongoing", value: "in_production", cosmic: "IN PRODUCTION" },
];

const FILTER_GROUPS = [
  { name: "Planets", items: ["Young Adult", "New Adult"] },
  { name: "Nebulas", items: ["Contemporary", "Fantasy", "Historical", "Paranormal", "Sci-Fi"] },
  { name: "Galaxies", items: ["Cozy", "Crime", "Dark Romance", "Horror", "Mystery", "Romance", "Suspense", "Thriller"] },
  { name: "Cosmos", items: ["Short Story", "Novella", "Novel", "Series"] },
];

export default function StoryFilter({ searchQuery, onSearchChange, selectedFilters, onToggleFilter, onClear, selectedStatus, onToggleStatus }) {
  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stories..."
          className="pl-9"
        />
      </div>

      {/* Status group — shows plain labels with cosmic subtitles for correlation */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 font-heading">
          Status
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((item) => {
            const active = selectedStatus?.includes(item.value);
            return (
              <button
                key={item.value}
                onClick={() => onToggleStatus(item.value)}
                className={`flex flex-col items-center px-2.5 py-1 rounded-full border transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-transparent text-foreground/60 border-border hover:border-primary/40 hover:text-foreground/90"
                }`}
              >
                <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                <span className={`text-[8px] tracking-wider leading-tight ${active ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                  {item.cosmic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {FILTER_GROUPS.map((group) => (
        <div key={group.name}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 font-heading">
            {group.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => {
              const active = selectedFilters.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => onToggleFilter(item)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-transparent text-foreground/60 border-border hover:border-primary/40 hover:text-foreground/90"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {(selectedFilters.length > 0 || (selectedStatus && selectedStatus.length > 0)) && (
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" /> Clear filters
        </button>
      )}
    </div>
  );
}
