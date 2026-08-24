import React, { useState } from "react";
import { Mail, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireSupabase } from "@/api/supabaseClient";
import { claimReaderUsername, getReaderToken, getSavedUsername } from "@/lib/readerIdentity";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(() => getSavedUsername());
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    if (!trimmedEmail) return;
    if (!trimmedUsername) {
      setError("Choose your Archive username first so your emails can greet you by name.");
      return;
    }

    setIsPending(true);
    try {
      const saved = getSavedUsername();
      if (!saved || saved !== trimmedUsername) {
        await claimReaderUsername(trimmedUsername);
      }

      const { data, error: invokeError } = await requireSupabase().functions.invoke("blog-subscribe", {
        body: { email: trimmedEmail, reader_token: getReaderToken() },
      });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err?.message || "Couldn't start the subscription. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-start gap-2 text-sm text-accent">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Check your email! ✨</p>
          <p className="text-xs text-muted-foreground mt-1">Confirm your subscription to start receiving Archive updates.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-md">
      {!getSavedUsername() && (
        <Input
          type="text"
          placeholder="Your Archive username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={40}
          className="bg-background/50 border-border/40 h-10"
          required
        />
      )}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 bg-background/50 border-border/40 h-10"
            required
          />
        </div>
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/80 gap-2 h-10 shrink-0">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Subscribe
        </Button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </form>
  );
}
