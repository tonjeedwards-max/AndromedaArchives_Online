import React, { useEffect, useRef } from "react";

const BEEHIIV_FORM_ID = "b531bae0-6d01-43f9-bbf9-2e7613fa45fb";
const BEEHIIV_SCRIPT_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";

export default function SubscribeForm() {
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;

    // Avoid loading duplicate beehiiv widgets if this component is mounted
    // more than once during client-side navigation.
    const existing = formRef.current.querySelector(
      `script[data-beehiiv-form="${BEEHIIV_FORM_ID}"]`
    );
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = BEEHIIV_SCRIPT_SRC;
    script.dataset.beehiivForm = BEEHIIV_FORM_ID;
    formRef.current.appendChild(script);

    return () => {
      // beehiiv owns the injected form markup; clear it when this component
      // unmounts so a later navigation can initialize a fresh widget cleanly.
      if (formRef.current) formRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="w-full max-w-md">
      <div
        ref={formRef}
        className="subscribe-form-shell w-full rounded-xl border border-border/40 bg-background/30 p-1 overflow-hidden [&_iframe]:max-w-full"
        aria-label="Subscribe to Andromeda Archives"
      />
    </div>
  );
}
