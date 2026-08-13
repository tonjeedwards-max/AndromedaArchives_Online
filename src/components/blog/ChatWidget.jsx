import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, Trash2, Ban, Shield, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ChatRulesGate from "./ChatRulesGate";
import ChatBadge from "./ChatBadge";
import BanAppealForm from "./BanAppealForm";
import AdminAppealPanel from "./AdminAppealPanel";
import { useStreak } from "@/hooks/useStreak";

const PROFANITY_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "piss",
  "slut", "whore", "cunt", "cock", "pussy", "twat", "wanker",
  "prick", "bollocks", "arsehole", "motherfucker", "douche", "retard",
];

function filterProfanity(text) {
  let filtered = text;
  PROFANITY_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}

function getOrCreate(key, generator) {
  let val = localStorage.getItem(key);
  if (!val) {
    val = generator();
    localStorage.setItem(key, val);
  }
  return val;
}

function formatEST(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    // Force UTC-5 (EST) regardless of daylight saving
    const estMs = date.getTime() - 5 * 60 * 60 * 1000;
    return new Date(estMs).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ChatWidget() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const guestToken = getOrCreate("guestToken", () => "g-" + Math.random().toString(36).substring(2, 10));
  const [guestName, setGuestName] = useState(() => getOrCreate("guestName", () => "Guest-" + Math.random().toString(36).substring(2, 6).toUpperCase()));
  const [editingName, setEditingName] = useState(false);
  const messagesEndRef = useRef(null);
  const cleanupRanRef = useRef(false);
  const [, setTick] = useState(0);

  // Allow the mobile bottom-nav Chat tab to open this panel
  useEffect(() => {
    const handler = () => setIsOpen((open) => !open);
    window.addEventListener("andromeda:open-chat", handler);
    return () => window.removeEventListener("andromeda:open-chat", handler);
  }, []);

  const { badgeTier } = useStreak();

  const rulesKey = `chatRulesAccepted_${guestToken}`;
  const [rulesAccepted, setRulesAccepted] = useState(() => localStorage.getItem(rulesKey) === "true");

  const [lastSeenTime, setLastSeenTime] = useState(() => {
    const stored = localStorage.getItem("lastSeenChatTime");
    if (stored) return Number(stored);
    const now = Date.now();
    localStorage.setItem("lastSeenChatTime", String(now));
    return now;
  });

  const { data: banInfo = [] } = useQuery({
    queryKey: ["banned", guestToken],
    queryFn: () => base44.entities.BannedGuest.filter({ guest_token: guestToken }),
  });
  const isBanned = banInfo.length > 0;

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: () => base44.entities.ChatMessage.list("-created_date", 200),
  });

  useEffect(() => {
    const unsub = base44.entities.ChatMessage.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Use the latest message timestamp (or now) to ensure all current messages are marked as seen
      const latestMsgTime = messages.length > 0
        ? Math.max(...messages.map((m) => (m.created_date ? new Date(m.created_date).getTime() : 0)))
        : 0;
      const now = Math.max(Date.now(), latestMsgTime);
      localStorage.setItem("lastSeenChatTime", String(now));
      setLastSeenTime(now);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me().catch(() => null),
  });
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin || !isOpen || cleanupRanRef.current || messages.length === 0) return;
    cleanupRanRef.current = true;

    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();
    base44.entities.ChatMessage.deleteMany({ created_date: { $lt: weekAgo } })
      .then(() => queryClient.invalidateQueries({ queryKey: ["chat-messages"] }))
      .catch(() => {});

    if (messages.length >= 200) {
      const cutoff = messages[99]?.created_date;
      if (cutoff) {
        base44.entities.ChatMessage.deleteMany({ created_date: { $lt: cutoff } })
          .then(() => queryClient.invalidateQueries({ queryKey: ["chat-messages"] }))
          .catch(() => {});
      }
    }

    const timer = setTimeout(() => { cleanupRanRef.current = false; }, 300000);
    return () => clearTimeout(timer);
  }, [isAdmin, isOpen, messages, queryClient]);

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const activeTokens = new Set(
    messages
      .filter((msg) => msg.created_date && new Date(msg.created_date).getTime() > fiveMinAgo)
      .map((msg) => msg.guest_token)
      .filter(Boolean)
  );
  const isSlowMode = activeTokens.size > 500;

  const [lastSentTime, setLastSentTime] = useState(() => Number(localStorage.getItem("lastChatMessageTime")) || 0);
  const slowModeBlocked = isSlowMode && Date.now() - lastSentTime < 30000;

  useEffect(() => {
    if (!isSlowMode || !slowModeBlocked) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSlowMode, slowModeBlocked]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: () =>
      base44.entities.ChatMessage.create({
        guest_name: guestName,
        message: filterProfanity(message.trim()),
        guest_token: guestToken,
        ...(isAdmin ? { is_staff: true } : {}),
        ...(badgeTier ? { badge_tier: badgeTier } : {}),
      }),
    onSuccess: () => {
      const now = Date.now();
      localStorage.setItem("lastChatMessageTime", String(now));
      setLastSentTime(now);
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      setMessage("");
    },
  });

  const { mutate: deleteMessage } = useMutation({
    mutationFn: (id) => base44.entities.ChatMessage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages"] }),
  });

  const { mutate: banUser } = useMutation({
    mutationFn: ({ token, name }) =>
      base44.entities.BannedGuest.create({ guest_token: token, guest_name: name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banned", guestToken] }),
  });

  const handleAcceptRules = () => {
    localStorage.setItem(rulesKey, "true");
    setRulesAccepted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || slowModeBlocked) return;
    sendMessage();
  };

  const weekAgoMs = Date.now() - WEEK_MS;
  const recentMessages = messages.filter(
    (msg) => !msg.created_date || new Date(msg.created_date).getTime() > weekAgoMs
  );
  const sortedMessages = [...recentMessages].reverse();
  const unreadCount = recentMessages.filter(
    (msg) => msg.created_date && new Date(msg.created_date).getTime() > lastSeenTime
  ).length;

  const slowModeRemaining = Math.ceil((30000 - (Date.now() - lastSentTime)) / 1000);
  const showRulesGate = !isAdmin && !rulesAccepted;

  return (
    <div className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-[calc(100vw-2rem)] sm:w-80 max-h-[60vh] bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-primary/10"
          >
            {isBanned ? (
              <BanAppealForm
                guestToken={guestToken}
                guestName={guestName}
                onClose={() => setIsOpen(false)}
              />
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  <span className="font-heading text-sm font-semibold">Community Chat</span>
                  <span className="text-xs text-muted-foreground ml-auto">{sortedMessages.length} msgs</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[150px] max-h-[35vh]">
                  {sortedMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8 font-light">
                      No messages yet. Say hi! 👋
                    </p>
                  ) : (
                    sortedMessages.map((msg) => {
                      const isStaff = !!msg.is_staff;
                      return (
                        <div key={msg.id} className="flex gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${isStaff ? "bg-accent/15 border-accent/30" : "bg-primary/10 border-primary/20"}`}>
                            <span className={`text-[10px] font-bold ${isStaff ? "text-accent" : "text-primary"}`}>
                              {msg.guest_name?.[0]?.toUpperCase() || "G"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="text-xs font-semibold text-foreground/90">{msg.guest_name}</span>
                              {isStaff && (
                                <span className="text-[8px] font-bold text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full">
                                  ADMIN
                                </span>
                              )}
                              <ChatBadge tier={msg.badge_tier} />
                              <span className="text-[9px] text-muted-foreground">
                                {formatEST(msg.created_date)} EST
                              </span>
                            </div>
                            <p className="text-xs text-foreground/75 leading-relaxed break-words">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {showRulesGate ? (
                  <ChatRulesGate onAccept={handleAcceptRules} />
                ) : (
                  <form onSubmit={handleSubmit} className="border-t border-border/40 p-3 shrink-0 space-y-2">
                    {isSlowMode && (
                      <p className="text-[10px] text-orange-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slowModeBlocked
                          ? `Slow mode: ${slowModeRemaining}s remaining`
                          : "Slow mode active (30s cooldown)"}
                      </p>
                    )}
                    {editingName ? (
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        onBlur={() => { localStorage.setItem("guestName", guestName); setEditingName(false); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { localStorage.setItem("guestName", guestName); setEditingName(false); } }}
                        className="h-7 text-xs"
                        maxLength={30}
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="text-[10px] text-muted-foreground hover:text-accent transition-colors"
                      >
                        posting as: {guestName} ✏️
                      </button>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={slowModeBlocked ? "Slow mode active..." : "Type a message..."}
                        className="h-9 text-xs flex-1"
                        maxLength={500}
                        disabled={slowModeBlocked}
                      />
                      <Button
                        type="submit"
                        disabled={isPending || !message.trim() || slowModeBlocked}
                        size="icon"
                        className="h-9 w-9 shrink-0"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </form>
                )}

                {isAdmin && (
                  <>
                    <AdminAppealPanel />
                    <div className="border-t border-border/40 p-3 bg-muted/30 max-h-48 overflow-y-auto">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Shield className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-semibold">Admin Controls</span>
                      </div>
                      <div className="space-y-1.5">
                        {messages.slice(0, 20).map((msg) => (
                          <div key={msg.id} className="flex items-center gap-2 text-xs">
                            <span className="font-medium truncate flex-1 min-w-0">
                              {msg.guest_name}: {msg.message}
                            </span>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="text-destructive hover:text-destructive/80 shrink-0"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => banUser({ token: msg.guest_token, name: msg.guest_name })}
                              className="text-orange-500 hover:text-orange-400 shrink-0"
                              title="Ban user"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 rounded-full bg-card border border-primary/40 shadow-lg shadow-primary/20 hidden lg:flex items-center justify-center hover:border-primary/70 transition-all duration-300 hover:scale-105"
        title={isOpen ? "Close chat" : "Open community chat"}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-foreground" />
        ) : (
          <MessageCircle className="w-5 h-5 text-primary" />
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
