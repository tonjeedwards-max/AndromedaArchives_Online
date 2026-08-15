import React from "react";
import { Outlet } from "react-router-dom";
import FloatingActions from "@/components/shared/FloatingActions";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import StarField from "../shared/StarField";
import ChatWidget from "@/components/blog/ChatWidget";
import CopyProtect from "@/components/shared/CopyProtect";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col relative pb-16 lg:pb-0">
      <StarField />
      <Navbar />
      <main className="flex-1 pt-16 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <CopyProtect />
      <BottomNav />
      <FloatingActions />
      <ChatWidget />
    </div>
  );
}
