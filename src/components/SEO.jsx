import { useEffect } from "react";

const SITE_NAME = "The Andromeda Archive";
const SITE_URL = "https://andromedaarchiveonline.netlify.app";
const DEFAULT_DESCRIPTION = "A cosmic archive of original sci-fi, romance, fantasy, paranormal, contemporary, and dark fiction, plus behind-the-ink blogs and worldbuilding.";

function upsertMeta(attribute, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attribute}="${CSS.escape(key)}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id, data) {
  let el = document.head.querySelector(`script[data-andromeda-jsonld="${id}"]`);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.andromedaJsonld = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  type = "website",
  image,
  noindex = false,
  breadcrumbs = [],
  structuredData,
}) {
  useEffect(() => {
    const url = new URL(path || "/", SITE_URL).toString();
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonical = url.replace(/\/$/, "") || SITE_URL;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    if (image) upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    if (image) upsertMeta("name", "twitter:image", image);
    upsertLink("canonical", canonical);

    const graph = [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ];

    if (breadcrumbs.length) {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(item.path ? { item: new URL(item.path, SITE_URL).toString() } : {}),
        })),
      });
    }

    if (structuredData) graph.push(structuredData);
    setJsonLd("page", { "@context": "https://schema.org", "@graph": graph });

    return () => {
      const json = document.head.querySelector('script[data-andromeda-jsonld="page"]');
      if (json) json.remove();
    };
  }, [title, description, path, type, image, noindex, JSON.stringify(breadcrumbs), JSON.stringify(structuredData)]);

  return null;
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
