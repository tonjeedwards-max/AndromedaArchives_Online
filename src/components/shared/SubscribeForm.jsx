import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireSupabase } from "@/api/supabaseClient";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data, error } = await requireSupabase().functions.invoke("blog-subscribe", {
        body: { email: email.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setDone(true);
      setMessage(data?.status === "already_subscribed"
        ? "You're already subscribed to blog updates. ✨"
        : "Check your inbox to confirm your subscription. ✨");
    },
    onError: (error) => {
      setMessage(error?.message || "We couldn't start your subscription. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    if (!email.trim()) return;
    mutate();
  };

  if (done) {
    return (
      <div className="flex items-start gap-2 text-sm text-accent max-w-md">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary/80 gap-2 h-10 shrink-0"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Subscribe
        </Button>
      </form>
      {message && (
        <p className="mt-2 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
}
