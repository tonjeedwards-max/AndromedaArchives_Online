import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Mail, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      base44.entities.Subscriber.create({ email: email.trim() }),
    onSuccess: () => setDone(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    mutate();
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-accent">
        <CheckCircle2 className="w-4 h-4" />
        <span>You're subscribed! Welcome to the cosmos ✨</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
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
  );
}
