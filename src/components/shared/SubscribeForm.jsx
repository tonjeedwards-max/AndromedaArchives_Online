import React, { useEffect, useRef } from "react";

const BEEHIIV_FORM_ID = "b531bae0-6d01-43f9-bbf9-2e7613fa45fb";
const BEEHIIV_SCRIPT_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";

export default function SubscribeForm() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    container.innerHTML = "";
    const script = document.createElement("script");
    script.async = true;
    script.src = BEEHIIV_SCRIPT_SRC;
    script.setAttribute("data-beehiiv-form", BEEHIIV_FORM_ID);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md min-h-[80px] flex items-center justify-center overflow-hidden"
      aria-label="Subscribe to The Andromeda Archive"
    />
  );
}
