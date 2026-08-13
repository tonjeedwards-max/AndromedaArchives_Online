import React, { useState } from "react";
import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const RULES = [
  "Be respectful. Treat everyone with kindness. No insults, hate speech, or toxic behavior.",
  "Stay on topic. Keep conversations relevant to the purpose of this chat.",
  "No spamming. Do not flood the chat with multiple messages or unsolicited promotions.",
  "Respect privacy. Do not share personal information or screenshots of private conversations.",
  "Listen to moderators. Their decisions are final.",
];

export default function ChatRulesGate({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <span className="font-heading text-sm font-semibold">Chat Rules</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Please review and accept the rules before joining the conversation.
      </p>
      <ul className="space-y-2">
        {RULES.map((rule, i) => (
          <li key={i} className="flex gap-2 text-[11px] text-foreground/80 leading-relaxed">
            <span className="text-primary font-bold shrink-0">{i + 1}.</span>
            {rule}
          </li>
        ))}
      </ul>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-4 h-4 rounded border-border accent-primary"
        />
        <span className="text-xs text-foreground/80">I have read and agree to the chat rules</span>
      </label>
      <Button onClick={onAccept} disabled={!checked} size="sm" className="w-full">
        <Check className="w-3.5 h-3.5" />
        Accept &amp; Chat
      </Button>
    </div>
  );
}
