import React, { useEffect, useRef, useState } from "react";

const BEEHIIV_FORM_ID = "b531bae0-6d01-43f9-bbf9-2e7613fa45fb";

export default function SubscribeForm() {
  const containerRef = useRef(null);
  const [loadEmbed, setLoadEmbed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loadEmbed) return;

    container.innerHTML = "";

    const observer = new MutationObserver(() => {
      container.querySelectorAll("iframe").forEach((iframe) => {
        if (!iframe.getAttribute("title")) {
          iframe.setAttribute("title", "Email subscription form");
        }
      });
    });

    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://subscribe-forms.beehiiv.com/v3/loader.js";
    script.dataset.beehiivForm = BEEHIIV_FORM_ID;

    container.appendChild(script);

    return () => {
      observer.disconnect();
      if (container) container.innerHTML = "";
    };
  }, [loadEmbed]);

  return (
    <div
      role="group"
      aria-label="Subscribe to The Andromeda Archive"
      className="w-full max-w-md min-h-[80px]"
    >
      {!loadEmbed ? (
        <button type="button" onClick={() => setLoadEmbed(true)} className="w-full min-h-[80px] rounded-lg border border-border/50 bg-card/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60">
          Subscribe to The Andromeda Archive
        </button>
      ) : (
        <div ref={containerRef} className="w-full min-h-[80px]" aria-live="polite" />
      )}
    </div>
  );
}