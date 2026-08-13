import React from "react";
import ReactMarkdown from "react-markdown";

function isHTML(content) {
  return /<p>|<div>|<h[1-6]>|<strong>|<em>|<ul>|<ol>|<img/i.test(content || "");
}

export default function MediaContent({ content, media, renderers }) {
  const mediaItems = media?.filter(Boolean) || [];

  // Richtext (HTML) content from dashboard editor — render directly
  if (isHTML(content) && mediaItems.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: content || "" }} />;
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
