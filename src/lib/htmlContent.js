const ALLOWED_TAGS = new Set([
  "P", "BR", "H1", "H2", "H3", "H4", "H5", "H6", "STRONG", "B", "EM", "I",
  "U", "S", "SUP", "BLOCKQUOTE", "HR", "UL", "OL", "LI", "A", "IMG", "FIGURE", "FIGCAPTION",
  "DIV", "SPAN", "PRE", "CODE"
]);

const ALLOWED_ATTRIBUTES = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height"]),
  SUP: new Set(["class", "data-definition", "title"]),
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
  const body = document.body;

  body.querySelectorAll("script, style, iframe, object, embed, form, input, button, textarea, select, meta, link, base").forEach((node) => node.remove());

  Array.from(body.querySelectorAll("*")).forEach((element) => {
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
      if (element.getAttribute("target") === "_blank") {
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (element.tagName === "IMG" && !isSafeUrl(element.getAttribute("src"), true)) {
      element.remove();
    }

    if (element.tagName === "SUP" && element.classList.contains("aa-definition") && !element.dataset.definition) {
      element.classList.remove("aa-definition");
    }
  });

  return body.innerHTML.trim();
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

/**
 * Turns superscripts in uploaded chapter HTML into tap/click definitions.
 *
 * Add this to chapter HTML:
 * <sup class="aa-definition" data-definition="The definition shown to readers.">1</sup>
 *
 * The definition is kept in the HTML itself, so individual chapter files remain portable.
 */
export function wireChapterDefinitions(container) {
  if (!container) return () => {};

  const closePopup = () => {
    const existing = document.querySelector(".aa-definition-popover");
    if (existing) existing.remove();
  };

  const openPopup = (trigger) => {
    closePopup();

    const definition = trigger.dataset.definition?.trim();
    if (!definition) return;

    const popup = document.createElement("div");
    popup.className = "aa-definition-popover";
    popup.setAttribute("role", "tooltip");
    popup.textContent = definition;
    document.body.appendChild(popup);

    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const maxWidth = Math.min(360, window.innerWidth - margin * 2);
    popup.style.maxWidth = `${maxWidth}px`;

    const popupRect = popup.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - popupRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - popupRect.width - margin));

    let top = rect.bottom + 10;
    if (top + popupRect.height > window.innerHeight - margin) {
      top = rect.top - popupRect.height - 10;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${Math.max(margin, top)}px`;
  };

  const triggers = Array.from(container.querySelectorAll("sup.aa-definition[data-definition]"));
  const handlers = triggers.map((trigger) => {
    const handler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const existing = document.querySelector(".aa-definition-popover");
      if (existing && trigger.dataset.definition === existing.dataset?.definition) {
        closePopup();
      } else {
        openPopup(trigger);
        const popup = document.querySelector(".aa-definition-popover");
        if (popup) popup.dataset.definition = trigger.dataset.definition;
      }
    };
    trigger.addEventListener("click", handler);
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-label", trigger.title || "Show definition");
    return [trigger, handler];
  });

  const onDocumentClick = (event) => {
    if (!event.target.closest("sup.aa-definition") && !event.target.closest(".aa-definition-popover")) {
      closePopup();
    }
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") closePopup();
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("sup.aa-definition")) {
      event.preventDefault();
      event.target.click();
    }
  };
  const onViewportChange = () => closePopup();

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, { passive: true });

  return () => {
    handlers.forEach(([trigger, handler]) => trigger.removeEventListener("click", handler));
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("scroll", onViewportChange);
    closePopup();
  };
}
