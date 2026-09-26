import React, { useEffect, useState } from "react";
import { BookMarked, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { sanitizeChapterHtml } from "@/lib/htmlContent";
import { requireSupabase } from "@/api/supabaseClient";

const isHttpUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const isSafeResourceUrl = (value) => {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return /^(https?:|data:image\/|#|\/)/i.test(normalized);
};

function prepareRemoteLoreDocument(source, sourceUrl) {
  const document = new DOMParser().parseFromString(source, "text/html");

  document.querySelectorAll(
    "script, iframe, object, embed, form, input, button, textarea, select, meta"
  ).forEach((node) => node.remove());

  document.querySelectorAll("*").forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value || "";

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attribute.name);
        return;
      }

      if (name === "href" || name === "src" || name === "poster") {
        if (!isSafeResourceUrl(value)) {
          element.removeAttribute(attribute.name);
        } else if (!value.startsWith("#") && !value.startsWith("data:")) {
          try {
            element.setAttribute(attribute.name, new URL(value, sourceUrl).href);
          } catch {
            element.removeAttribute(attribute.name);
          }
        }
      }
    });
  });

  document.querySelectorAll("a[href]").forEach((anchor) => {
    const target = anchor.getAttribute("target");
    if (target === "_blank") {
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });

  document.querySelectorAll("style").forEach((style) => {
    style.textContent = style.textContent
      .replace(/@import\\s+[^;]+;?/gi, "")
      .replace(/expression\\s*\\(/gi, "")
      .replace(/javascript\\s*:/gi, "");
  });

  const existingBase = document.querySelector("base");
  if (existingBase) existingBase.remove();

  const base = document.createElement("base");
  base.href = sourceUrl;
  document.head.prepend(base);

  return "<!doctype html>" + document.documentElement.outerHTML;
}

function RemoteLore({ url, title }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFailed(false);
      setHtml("");

      try {
        const { data, error } = await requireSupabase().functions.invoke("lore-proxy", {
          body: { url },
        });

        if (error) throw error;

        const source = data?.html;
        if (!source) throw new Error(data?.error || "Empty lore document");

        const document = new DOMParser().parseFromString(source, "text/html");
        if (!document.body?.innerHTML?.trim()) {
          throw new Error("Empty lore document");
        }

        const prepared = prepareRemoteLoreDocument(source, url);

        if (!cancelled) setHtml(prepared);
      } catch (error) {
        console.error("Failed to load remote lore", error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          The reference page could not be embedded here.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-accent hover:underline text-sm"
        >
          Open {title || "lore reference"} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md border border-border/30 bg-background">
      <iframe
        title={title || "Lore reference"}
        srcDoc={html}
        sandbox="allow-same-origin"
        className="block w-full border-0"
        style={{ minHeight: "75vh" }}
      />
    </div>
  );
}

export default function StoryLore({ entries = [] }) {
  const grouped = entries.reduce((groups, entry) => {
    const category = entry.category?.trim() || "Lore";
    if (!groups[category]) groups[category] = [];
    groups[category].push(entry);
    return groups;
  }, {});

  const categories = Object.entries(grouped);

  if (!categories.length) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
        <div className="flex items-center gap-3">
          <BookMarked className="w-5 h-5 text-accent" />
          <div>
            <h2 className="font-heading text-lg font-semibold">Lore & Reference</h2>
            <p className="text-sm text-muted-foreground">
              A spoiler-aware reference guide for this story's world.
            </p>
          </div>
        </div>
      </div>

      {categories.map(([category, categoryEntries]) => (
        <section key={category} className="space-y-3">
          <h3 className="font-heading text-xl font-semibold">{category}</h3>
          <div className="space-y-2">
            {categoryEntries.map((entry, index) => {
              const content = String(entry.content || "").trim();
              const externalReference = isHttpUrl(content);

              return (
                <details
                  key={entry.id}
                  className="group rounded-lg border border-border/40 bg-card/50 overflow-hidden"
                  open={index === 0 && categoryEntries.length === 1}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{entry.title}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border/30 px-4 py-4">
                    {externalReference ? (
                      <RemoteLore url={content} title={entry.title} />
                    ) : (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeChapterHtml(content),
                        }}
                      />
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
