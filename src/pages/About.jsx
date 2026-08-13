import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, PenLine, BookOpen } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";

const crew = [
{ name: "Essie (Taj M. Morgan)", role: "Author & Plot Sadist", icon: PenLine, color: "text-primary" },
{ name: "Akuma (Oda Bennette)", role: "Author & Plot Sadist", icon: PenLine, color: "text-primary" },
{ name: "Bibi", role: "Editor", icon: BookOpen, color: "text-accent" },
{ name: "Hin", role: "Editor", icon: BookOpen, color: "text-accent" }];


export default function About() {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <SectionHeading title="About the Archives" subtitle="One of many archives, made with love" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6">
        
        <div className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-accent" />
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">Welcome, Starling!</h1>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed font-light">
            <p>
              Hiii! This is our archive and by "our," I mean Essie, Akuma, Bibi, and Hin! Welcome to our little corner of the internet where we meme, roleplay, and share our wacky, unhinged stories with you all!
            </p>
            <p>
              If you were wondering who is running this joint: Essie (Taj M. Morgan) and Akuma (Oda Bennette) are your resident authors and full-time plot sadists, while Bibi and Hin hold down the fort as our hardworking editors (they'd rather not give themselves cool fancy alias names for whatever reason, lol).
            </p>
            <p>So, what even is this app? I originally built this thing for our small core group to post our late-night ramblings, light novels, and lore dumps without having to ping everyone individually in group chats. But honestly? Anyone is welcome to nose-dive deep into our universe if they wanna! Whether you're here to binge fantasy chapters, check out our latest site features, or just hang out with fellow Starlings in the comments, you're in the right place. Just be nice, or we'll make our story characters suffer even more lol. Explore around and make yourself at home!

            </p>
          </div>
        </div>

        {/* Crew cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {crew.map((member, i) =>
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/40 hover:border-primary/40 transition-all">
            
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border/40 flex items-center justify-center shrink-0">
                <member.icon className={`w-5 h-5 ${member.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground font-light flex items-center justify-center gap-1.5 pt-2">
          Made with <Heart className="w-3.5 h-3.5 text-secondary" /> by the Andromeda Archive crew
        </p>
      </motion.div>
    </div>);

}
