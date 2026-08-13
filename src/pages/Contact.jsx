import React from "react";
import { motion } from "framer-motion";
import { Mail, ExternalLink, Sparkles } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const socialLinks = [
  { name: "Tapas", url: "https://tapas.io/World_Essegate07", handle: "@World_Essegate07" },
  { name: "X (Twitter)", url: "https://x.com/world_essegate", handle: "@world_essegate" },
  { name: "Instagram", url: "https://www.instagram.com/world_essegate/", handle: "@world_essegate" },
];

export default function Contact() {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <SectionHeading title="Contact" subtitle="Find us across the digital cosmos" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Intro */}
        <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h1 className="font-heading text-xl sm:text-2xl font-semibold">Find Us Across the Digital Cosmos!</h1>
          </div>
          <div className="space-y-3 text-foreground/80 leading-relaxed font-light text-sm sm:text-base">
            <p>
              Got a question, spotted a weird bug on the site, or just want to scream about the latest plot twist? We'd love to hear from you!
            </p>
            <p>
              Well... for now, it's really just Essie you can reach directly! The rest of the crew isn't quite ready to put their socials out into the wild yet (and honestly, Bibi never will, so that's that, lol).
            </p>
          </div>

          {/* Email */}
          <div className="mt-6 p-4 rounded-lg bg-muted/40 border border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Drop an email anytime
            </p>
            <a
              href="mailto:essieworld07@gmail.com"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" />
              essieworld07@gmail.com
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4 text-center">Catch Essie Around the Web!</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card/50 border border-border/40 hover:border-primary/40 hover:bg-card/80 transition-all duration-300 group"
              >
                <span className="text-sm font-semibold group-hover:text-accent transition-colors">{link.name}</span>
                <span className="text-xs text-muted-foreground">{link.handle}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground font-light">
          Don't be shy—pop over, say hi, and join the Starlings community! ✨
        </p>
      </motion.div>
    </div>
  );
}
