import React, { useState, useEffect, useRef } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2, Trash2, Ban, Shield, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ChatRulesGate from "./ChatRulesGate";
import ChatBadge from "./ChatBadge";
import { useStreak } from "@/hooks/useStreak";

const PROFANITY_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "piss",
  "slut", "whore", "cunt", "cock", "pussy", "twat", "wanker",
  "prick", "bollocks", "arsehole", "motherfucker", "douche", "retard",
];

function filterProfanity(text) {
  let filtered = text;
  PROFANITY_WORDS.forEach((word) => {
    filtered = filtered.replace(new RegExp(`\\b${word}\\b`, "gi"), "*".repeat(word.length));
  });
  return filtered;
}

function getOrCreate(key, generator) {
  let value = localStorage.getItem(key);
  if (!value) {
    value = generator();
    localStorage.setItem(key, value);
  }
  return value;
}

function formatEST(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const estMs = date.getTime() - 5 * 60 * 60 * 1000;
    return new Date(estMs).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHAT_ROOM_KEY = "general";

export default function ChatWidget() {
  const queryClient = useQueryClient();
  const { badgeTier } = useStreak();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const guestToken = getOrCreate("guestToken", () => "g-" + Math.random().toString(36).substring(2, 10));
  const [guestName, setGuestName] = useState(() => getOrCreate("guestName", () => "Guest-" + Math.random().toString(36).substring(2, 6).toUpperCase()));
  const [editingName, setEditingName] = useState(false);
  const messagesEndRef = useRef(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setIsOpen((open) => !open);
    window.addEventListener("andromeda:open-chat", handler);
    return () => window.removeEventListener("andromeda:open-chat", handler);
  }, []);

  const rulesKey = `chatRulesAccepted_${guestToken}`;
  const [rulesAccepted, setRulesAccepted] = useState(() => localStorage.getItem(rulesKey) === "true");
  const [lastSeenTime, setLastSeenTime] = useState(() => Number(localStorage.getItem("lastSeenChatTime")) || Date.now());
  const [lastSentTime, setLastSentTime] = useState(() => Number(localStorage.getItem("lastChatMessageTime")) || 0);

  const { data: room } = useQuery({
    queryKey: ["chat-room", CHAT_ROOM_KEY],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("chat_rooms")
        .select("id, room_key, name, description, is_active")
        .eq("room_key", CHAT_ROOM_KEY)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: chatUser } = useQuery({
    queryKey: ["chat-user", guestToken],
    queryFn: async () => {
      const client = requireSupabase();
      const { data: existing, error: lookupError } = await client
        .from("chat_users")
        .select("id, user_token, display_name, is_banned, ban_reason")
        .eq("user_token", guestToken)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) return existing;
      const { data, error } = await client
        .from("chat_users")
        .insert({ user_token: guestToken, display_name: guestName })
        .select("id, user_token, display_name, is_banned, ban_reason")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ["chat-admin", chatUser?.id],
    enabled: Boolean(chatUser?.id),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("chat_admins")
        .select("user_id")
        .eq("user_id", chatUser.id)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const { data: messagesData = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", room?.id],
    enabled: Boolean(room?.id),
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("chat_messages")
        .select("id, room_id, user_id, display_name, content, is_deleted, created_at, updated_at")
        .eq("room_id", room.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    initialData: [],
  });

  const messages = Array.isArray(messagesData) ? messagesData : [];

  useEffect(() => {
    if (!room?.id) return;
    const client = requireSupabase();
    const channel = client
      .channel(`chat-room-${room.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_messages", filter: `room_id=eq.${room.id}`,
      }, () => queryClient.invalidateQueries({ queryKey: ["chat-messages", room.id] }))
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [room?.id, queryClient]);

  useEffect(() => {
    if (!isOpen) return;
    const latest = messages.length ? Math.max(...messages.map((m) => new Date(m.created_at).getTime())) : Date.now();
    const now = Math.max(Date.now(), latest);
    localStorage.setItem("lastSeenChatTime", String(now));
    setLastSeenTime(now);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages]);

  const activeTokens = new Set(
    messages
      .filter((msg) => msg.created_at && Date.now() - new Date(msg.created_at).getTime() < 5 * 60 * 1000)
      .map((msg) => msg.user_id)
      .filter(Boolean)
  );
  const isSlowMode = activeTokens.size > 500;
  const slowModeBlocked = isSlowMode && Date.now() - lastSentTime < 30000;

  useEffect(() => {
    if (!slowModeBlocked) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [slowModeBlocked]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async () => {
      if (!room?.id || !chatUser?.id) throw new Error("Chat is not ready yet.");
      const content = filterProfanity(message.trim());
      const { error } = await requireSupabase().from("chat_messages").insert({
        room_id: room.id,
        user_id: chatUser.id,
        display_name: guestName.trim().slice(0, 30),
        content,
        is_deleted: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      const now = Date.now();
      localStorage.setItem("lastChatMessageTime", String(now));
      setLastSentTime(now);
      queryClient.invalidateQueries({ queryKey: ["chat-messages", room?.id] });
      setMessage("");
    },
  });

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (id) => {
      const { error } = await requireSupabase().from("chat_messages").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages", room?.id] }),
  });

  const { mutate: banUser } = useMutation({
    mutationFn: async (userId) => {
      const { error } = await requireSupabase().from("chat_users").update({ is_banned: true, ban_reason: "Banned by moderator" }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages", room?.id] }),
  });

  const handleAcceptRules = () => {
    localStorage.setItem(rulesKey, "true");
    setRulesAccepted(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || slowModeBlocked || !room?.id || !chatUser?.id || chatUser?.is_banned) return;
    sendMessage();
  };

  const recentMessages = messages.filter((msg) => !msg.created_at || Date.now() - new Date(msg.created_at).getTime() < WEEK_MS);
  const sortedMessages = [...recentMessages].reverse();
  const unreadCount = recentMessages.filter((msg) => msg.created_at && new Date(msg.created_at).getTime() > lastSeenTime).length;
  const slowModeRemaining = Math.max(0, Math.ceil((30000 - (Date.now() - lastSentTime)) / 1000));
  const showRulesGate = !isAdmin && !rulesAccepted;
  const isBanned = Boolean(chatUser?.is_banned);

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
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="font-heading text-sm font-semibold">Community Chat</span>
              <span className="text-xs text-muted-foreground ml-auto">{sortedMessages.length} msgs</span>
            </div>

            {isBanned ? (
              <div className="p-6 text-center space-y-2">
                <Ban className="w-8 h-8 text-destructive mx-auto" />
                <p className="text-sm font-medium">You have been banned from chat.</p>
                <p className="text-xs text-muted-foreground">{chatUser?.ban_reason || "A moderator has restricted this account."}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[150px] max-h-[35vh]">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                  ) : sortedMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8 font-light">No messages yet. Say hi! 👋</p>
                  ) : (
                    sortedMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
                          <span className="text-[10px] font-bold text-primary">{msg.display_name?.[0]?.toUpperCase() || "G"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-xs font-semibold text-foreground/90">{msg.display_name}</span>
                            <ChatBadge tier={badgeTier} />
                            <span className="text-[9px] text-muted-foreground">{formatEST(msg.created_at)} EST</span>
                            {isAdmin && <button onClick={() => deleteMessage(msg.id)} className="ml-auto text-destructive" title="Delete message"><Trash2 className="w-3 h-3" /></button>}
                            {isAdmin && <button onClick={() => banUser(msg.user_id)} className="text-orange-500" title="Ban user"><Ban className="w-3 h-3" /></button>}
                          </div>
                          <p className="text-xs text-foreground/75 leading-relaxed break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {showRulesGate ? (
                  <ChatRulesGate onAccept={handleAcceptRules} />
                ) : (
                  <form onSubmit={handleSubmit} className="border-t border-border/40 p-3 shrink-0 space-y-2">
                    {isSlowMode && <p className="text-[10px] text-orange-500 flex items-center gap-1"><Clock className="w-3 h-3" />{slowModeBlocked ? `Slow mode: ${slowModeRemaining}s remaining` : "Slow mode active (30s cooldown)"}</p>}
                    {editingName ? (
                      <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} onBlur={() => { localStorage.setItem("guestName", guestName); setEditingName(false); }} onKeyDown={(e) => { if (e.key === "Enter") { localStorage.setItem("guestName", guestName); setEditingName(false); } }} className="h-7 text-xs" maxLength={30} autoFocus />
                    ) : (
                      <button type="button" onClick={() => setEditingName(true)} className="text-[10px] text-muted-foreground hover:text-accent transition-colors">posting as: {guestName} ✏️</button>
                    )}
                    <div className="flex gap-2">
                      <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={slowModeBlocked ? "Slow mode active..." : "Type a message..."} className="h-9 text-xs flex-1" maxLength={500} disabled={slowModeBlocked} />
                      <Button type="submit" disabled={isPending || !message.trim() || slowModeBlocked || !room?.id || !chatUser?.id} size="icon" className="h-9 w-9 shrink-0">
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </form>
                )}

                {isAdmin && (
                  <div className="border-t border-border/40 p-3 bg-muted/30">
                    <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-accent" /><span className="text-xs font-semibold">Admin Controls</span></div>
                    <p className="text-[10px] text-muted-foreground mt-1">Delete messages or ban users directly from the chat.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="relative w-12 h-12 rounded-full bg-card border border-primary/40 shadow-lg shadow-primary/20 hidden lg:flex items-center justify-center hover:border-primary/70 transition-all duration-300 hover:scale-105" title={isOpen ? "Close chat" : "Open community chat"}>
        {isOpen ? <X className="w-5 h-5 text-foreground" /> : <MessageCircle className="w-5 h-5 text-primary" />}
        {!isOpen && unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
    </div>
  );
}
