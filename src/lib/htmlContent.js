const ALLOWED_TAGS = new Set([
  "P", "BR", "H1", "H2", "H3", "H4", "H5", "H6", "STRONG", "B", "EM", "I",
  "U", "S", "BLOCKQUOTE", "HR", "UL", "OL", "LI", "A", "IMG", "FIGURE", "FIGCAPTION",
  "DIV", "SPAN", "PRE", "CODE"
]);

const ALLOWED_ATTRIBUTES = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height"]),
  FIGURE: new Set([]),
  FIGCAPTION: new Set([]),
};

const isSafeUrl = (value, allowDataImage = false) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (allowDataImage && normalized.startsWith("data:image/")) return true;
  return /^(https?:|mailto:|#|\/)/i.test(value.trim());
};

export function sanitizeChapterHtml(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  document.querySelectorAll("script, style, iframe, object, embed, form, input, button, textarea, select, meta, link, base").forEach((node) => node.remove());

  document.querySelectorAll("*").forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const allowed = ALLOWED_ATTRIBUTES[element.tagName]?.has(name) ?? false;
      if (name.startsWith("on") || !allowed) element.removeAttribute(attribute.name);
    });

    if (element.tagName === "A") {
      if (!isSafeUrl(element.getAttribute("href"))) element.removeAttribute("href");
      if (element.getAttribute("target") === "_blank") element.setAttribute("rel", "noopener noreferrer");
    }

    if (element.tagName === "IMG" && !isSafeUrl(element.getAttribute("src"), true)) {
      element.remove();
    }
  });

  return document.body.innerHTML.trim();
}

export function htmlToPlainText(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  return (document.body.textContent || "").replace(/\s+/g, " ").trim();
}

export function countWords(html) {
  const text = htmlToPlainText(html);
  return text ? text.split(/\s+/).length : 0;
}
