import React from "react";
import { sanitizeChapterHtml } from "@/lib/htmlContent";

export default function HtmlContent({ html, className = "" }) {
  const safeHtml = React.useMemo(() => sanitizeChapterHtml(html || ""), [html]);

  if (!safeHtml) return null;

  return (
    <div
      className={`chapter-html-content prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
