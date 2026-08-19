import React from "react";
import ReactMarkdown from "react-markdown";
import { sanitizeChapterHtml } from "@/lib/htmlContent";

function isHTML(content) {
  return /<\/?[a-z][^>]*>/i.test(content || "");
}

export default function MediaContent({ content, media, renderers }) {
  const mediaItems = media?.filter(Boolean) || [];
  const safeContent = React.useMemo(
    () => (isHTML(content) ? sanitizeChapterHtml(content) : content || ""),
    [content]
  );

  // Uploaded chapter HTML is sanitized before rendering. Keep the wrapper
  // class separate from the site's generic prose styles so the uploaded
  // document gets predictable literary spacing inside the reader.
  if (isHTML(content) && mediaItems.length === 0) {
    return (
      <div
        className="reader-html-content"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    );
  }

  if (mediaItems.length === 0) {
    return <ReactMarkdown components={renderers}>{content || ""}</ReactMarkdown>;
  }

  const paragraphs = (content || "").split(/\n\n+/);
  const interval = Math.max(1, Math.ceil(paragraphs.length / (mediaItems.length + 1)));
  let mediaIdx = 0;

  return (
    <>
      {paragraphs.map((para, i) => {
        const showImage = (i + 1) % interval === 0 && mediaIdx < mediaItems.length;
        const imgSrc = showImage ? mediaItems[mediaIdx++] : null;
        return (
          <React.Fragment key={i}>
            <ReactMarkdown components={renderers}>{para}</ReactMarkdown>
            {showImage && imgSrc && (
              <figure className="my-8 text-center">
                <img
                  src={imgSrc}
                  alt={`Illustration ${mediaIdx}`}
                  className="mx-auto rounded-lg max-w-full shadow-md"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
              </figure>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
