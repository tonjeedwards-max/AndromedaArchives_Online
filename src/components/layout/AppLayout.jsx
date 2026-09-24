import React from "react";
import { Outlet } from "react-router-dom";
import FloatingActions from "@/components/shared/FloatingActions";
import ChatWidget from "@/components/shared/ChatWidget";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import StarField from "../shared/StarField";
import CopyProtect from "@/components/shared/CopyProtect";
import { PodcastPlayerProvider } from "@/components/podcasts/PodcastPlayerContext";

export default function AppLayout() {
  return (
    <PodcastPlayerProvider>
      <div className="min-h-screen flex flex-col relative pb-16 lg:pb-0">
        <StarField />
        <Navbar />
        <main className="flex-1 pt-16 overflow-x-hidden">
          <Outlet />
        </main>
        <Footer />
        <CopyProtect />
        <BottomNav />
        <ChatWidget />
        <FloatingActions />
      </div>
    </PodcastPlayerProvider>
  );
}
