import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import ChatRulesGate from "@/components/blog/ChatRulesGate";

const TOKEN_KEY = "andromeda-chat-token";
const NAME_KEY = "andromeda-chat-name";
const RULES_KEY_PREFIX = "andromeda-chat-rules-accepted-";
const ROOM_ID = 1;

function getToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [draft, setDraft] = useState("");
  const [userId, setUserId] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const token = useMemo(getToken, []);
  const rulesKey = `${RULES_KEY_PREFIX}${token}`;

  useEffect(() => {
    setRulesAccepted(localStorage.getItem(rulesKey) === "true");
  }, [rulesKey]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    async function bootstrap() {
      const { data: existing, error: lookupError } = await supabase
        .from("chat_users")
        .select("id, display_name, is_banned")
        .eq("user_token", token)
        .maybeSingle();

      if (lookupError) {
        if (!cancelled) setError("Chat is temporarily unavailable.");
        return;
      }

      if (existing) {
        if (!cancelled) {
          setUserId(existing.id);
          setIsBanned(Boolean(existing.is_banned));
          if (existing.display_name && !name) setName(existing.display_name);
        }
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("chat_users")
        .insert({ user_token: token, display_name: name.trim() || "Starling", is_banned: false })
        .select("id, is_banned")
        .single();

      if (!cancelled) {
        if (createError) setError("Chat is temporarily unavailable.");
        else {
          setUserId(created.id);
          setIsBanned(Boolean(created.is_banned));
        }
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [token]);

  const loadMessages = async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("chat_messages")
      .select("id, user_id, display_name, content, created_at")
      .eq("room_id", ROOM_ID)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(100);
    if (!loadError) setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!open || !supabase) return;
    loadMessages();
    const interval = window.setInterval(loadMessages, 5000);
    const channel = supabase
      .channel("andromeda-general-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${ROOM_ID}` }, loadMessages)
      .subscribe();

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const acceptRules = () => {
    localStorage.setItem(rulesKey, "true");
    setRulesAccepted(true);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    const displayName = name.trim() || "Starling";
    if (!content || !userId || !supabase || loading || isBanned || !rulesAccepted) return;

    setLoading(true);
    setError("");
    localStorage.setItem(NAME_KEY, displayName);

    const { error: sendError } = await supabase.from("chat_messages").insert({
      room_id: ROOM_ID,
      user_id: userId,
      display_name: displayName,
      content,
      is_deleted: false,
    });

    if (sendError) {
      setError(sendError.message.includes("chat_can_send")
        ? "You are sending messages too quickly. Try again in a moment."
        : "Couldn't send that message.");
    } else {
      setDraft("");
      await loadMessages();
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-50">
      {open && (
        <div className="mb-3 w-[min(90vw,380px)] max-h-[70vh] flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <div>
              <p className="font-heading font-semibold">Starlings' Chat</p>
              <p className="text-[11px] text-muted-foreground">General discussion & feedback</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground" aria-label="Close chat"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[160px]">
            {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Be the first Starling to say hi!</p>}
            {messages.map((message) => (
              <div key={message.id} className="rounded-xl bg-muted/50 px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-accent">{message.display_name || "Starling"}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(message.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">{message.content}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {isBanned ? (
            <div className="border-t border-border/40 p-4 text-center text-sm text-destructive">You are currently unable to use chat.</div>
          ) : !rulesAccepted ? (
            <div className="border-t border-border/40">
              <ChatRulesGate onAccept={acceptRules} />
            </div>
          ) : (
            <form onSubmit={sendMessage} className="border-t border-border/40 p-3 space-y-2">
              <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => localStorage.setItem(NAME_KEY, name.trim() || "Starling")} maxLength={40} placeholder="Your display name" className="w-full rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs outline-none focus:border-primary" />
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} placeholder="Say something..." className="min-w-0 flex-1 rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary" />
                <button disabled={loading || !userId || !draft.trim()} className="rounded-lg bg-primary px-3 text-primary-foreground disabled:opacity-50" aria-label="Send message">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-[11px] text-destructive">{error}</p>}
            </form>
          )}
        </div>
      )}

      <button onClick={() => setOpen((value) => !value)} className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-card shadow-lg shadow-primary/20 transition-transform hover:scale-105" aria-label="Open chat" title="Chat">
        <MessageCircle className="h-5 w-5 text-primary" />
      </button>
    </div>
  );
}
