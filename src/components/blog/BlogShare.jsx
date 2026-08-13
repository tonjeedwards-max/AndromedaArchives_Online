import React, { useState } from "react";
import { Share2, Copy, Check, Link2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function BlogShare({ title, excerpt }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = excerpt || title || "Check out this blog post!";

  const handleNativeShare = async () => {
    base44.analytics.track({ eventName: "blog_share_click", properties: { method: "native" } });
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {}
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    base44.analytics.track({ eventName: "blog_share_click", properties: { method: "copy" } });
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <section className="py-8 border-t border-border/30">
      <div className="flex items-center gap-2 mb-5">
        <Share2 className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold">Share this post</h3>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/60 text-foreground/80 text-sm font-medium hover:bg-muted transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </motion.button>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => base44.analytics.track({ eventName: "blog_share_click", properties: { method: "tweet" } })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/60 text-foreground/80 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Send className="w-4 h-4" />
          Tweet
        </a>

        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => base44.analytics.track({ eventName: "blog_share_click", properties: { method: "facebook" } })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/60 text-foreground/80 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Facebook
        </a>
      </div>
    </section>
  );
}
