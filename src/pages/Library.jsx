import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { BookOpen, Bookmark, Heart, Clock, Trash2, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import SectionHeading from "@/components/shared/SectionHeading";
import StoryProgressList from "@/components/library/StoryProgressList";

const tabs = [
  { id: "progress", label: "Progress", icon: BarChart },
  { id: "history", label: "History", icon: Clock },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "favourites", label: "Favourites", icon: Heart },
];

function EntryList({ entries, onRemove, emptyMsg }) {
  if (entries.length === 0) return <p className="text-center text-muted-foreground py-12 font-light">{emptyMsg}</p>;

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const chapterNumber = Number(entry.chapterNumber ?? entry.chapterId);
        const destination = entry.storyId && Number.isInteger(chapterNumber)
          ? `/story/${entry.storyId}/chapter/${chapterNumber}`
          : "/stories";
        return (
          <motion.div key={entry.historyKey || entry.chapterId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 transition-all group">
            <Link to={destination} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{entry.storyTitle}</p>
                <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">Last read: Chapter {chapterNumber}{entry.title ? ` — ${entry.title}` : ""}</p>
                {entry.readAt && <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(entry.readAt), { addSuffix: true })}</p>}
              </div>
            </Link>
            {onRemove && <button onClick={() => onRemove(entry)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Library() {
  const [activeTab, setActiveTab] = useState("history");
  const { history, readChapters, toggleBookmark, bookmarks, favourites, toggleFavourite } = useReaderPrefs();
  const historyList = Object.values(history).sort((a, b) => new Date(b.readAt) - new Date(a.readAt));
  const bookmarkList = Object.values(bookmarks).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  const favouriteList = Object.values(favourites).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  const progressCount = new Set(Object.values(history).map((h) => h.storyId).filter(Boolean)).size;

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12">
      <SectionHeading title="My Library" subtitle="Your reading history, bookmarks, and favourite chapters" />
      <div className="flex gap-1 sm:gap-2 mb-8 border-b border-border/40 pb-0 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />{label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{id === "progress" ? progressCount : id === "history" ? historyList.length : id === "bookmarks" ? bookmarkList.length : favouriteList.length}</span>
          </button>
        ))}
      </div>
      {activeTab === "progress" && <StoryProgressList history={history} readChapters={readChapters} />}
      {activeTab === "history" && <EntryList entries={historyList} emptyMsg="You haven't read any chapters yet. Start exploring!" />}
      {activeTab === "bookmarks" && <EntryList entries={bookmarkList} onRemove={toggleBookmark} emptyMsg="No bookmarks yet. Bookmark chapters while reading to find them here." />}
      {activeTab === "favourites" && <EntryList entries={favouriteList} onRemove={toggleFavourite} emptyMsg="No favourites yet. Heart a chapter while reading to save it here." />}
    </div>
  );
}
