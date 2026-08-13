import React from "react";
import { Sparkles } from "lucide-react";

export default function SectionHeading({ title, subtitle, centered = true }) {
  return (
    <div className={`mb-10 ${centered ? "text-center" : ""}`}>
      <div className={`flex items-center gap-3 mb-3 ${centered ? "justify-center" : ""}`}>
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent/60" />
        <Sparkles className="w-4 h-4 text-accent" />
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent/60" />
      </div>
      <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto font-light">
          {subtitle}
        </p>
      )}
    </div>
  );
}
