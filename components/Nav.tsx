"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { CONTACT } from "@/lib/content";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[6%] py-5 transition-all duration-500 md:px-[10%] ${
        scrolled
          ? "border-b border-[rgba(242,231,219,0.08)] bg-[rgba(26,21,18,0.72)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a href="#top" aria-label="Upcore AI — inicio" className="inline-flex">
        <Logo markClass="h-7 w-7" textClass="text-[1.25rem]" />
      </a>
      <a
        href={CONTACT.calendly}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-shine rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-semibold text-sand transition-all duration-300 hover:border-clay hover:bg-clay hover:text-obsidian"
      >
        Agenda tu diagnóstico
      </a>
    </nav>
  );
}
