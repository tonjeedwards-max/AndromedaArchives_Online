import React, { useEffect } from "react";

export default function CopyProtect() {
  useEffect(() => {
    const preventContext = (e) => e.preventDefault();
    const preventCopy = (e) => e.preventDefault();
    const preventKey = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        navigator.clipboard?.writeText("").catch(() => {});
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && ["p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };
    const clearClipboard = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        navigator.clipboard?.writeText("").catch(() => {});
      }
    };

    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("keydown", preventKey);
    document.addEventListener("keyup", clearClipboard);

    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("keydown", preventKey);
      document.removeEventListener("keyup", clearClipboard);
    };
  }, []);

  return null;
}
