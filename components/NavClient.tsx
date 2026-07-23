"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { AgendarCTA } from "./AgendarCTA";

export type EnlaceNav =
  | { label: string; href: string; items?: undefined }
  | { label: string; href?: undefined; items: { href: string; label: string }[] };

export function NavClient({ enlaces }: { enlaces: EnlaceNav[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const conFondo = scrolled || abierto;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[6%] py-5 transition-all duration-500 md:px-[10%] ${
        conFondo
          ? "border-b border-[rgba(242,231,219,0.08)] bg-[rgba(26,21,18,0.72)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a href="/" aria-label="Upcore AI — inicio" className="inline-flex">
        <Logo markClass="h-7 w-7" textClass="text-[1.25rem]" />
      </a>

      {/* Menú desktop */}
      <div className="hidden items-center gap-1 lg:flex">
        {enlaces.map((e) =>
          e.items ? (
            <div key={e.label} className="group relative">
              <button
                type="button"
                aria-haspopup="true"
                className="rounded-full px-4 py-2 text-sm font-medium text-mocha transition-colors hover:text-sand"
              >
                {e.label} <span aria-hidden>▾</span>
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="w-64 rounded-2xl border border-[rgba(242,231,219,0.1)] bg-[rgba(26,21,18,0.92)] p-2 backdrop-blur-xl">
                  {e.items.map((it) => (
                    <a
                      key={it.href}
                      href={it.href}
                      className="block rounded-xl px-4 py-2.5 text-sm text-mocha transition-colors hover:bg-[rgba(242,231,219,0.06)] hover:text-sand"
                    >
                      {it.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <a
              key={e.href}
              href={e.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-mocha transition-colors hover:text-sand"
            >
              {e.label}
            </a>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <AgendarCTA
          label="Agenda tu diagnóstico"
          className="btn-shine hidden rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-semibold text-sand transition-all duration-300 hover:border-clay hover:bg-clay hover:text-obsidian sm:block"
        />
        {/* Hamburguesa (móvil/tablet) */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(242,231,219,0.2)] text-sand transition-colors hover:border-clay lg:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            {abierto ? (
              <>
                <path d="M3 3 L15 15" />
                <path d="M15 3 L3 15" />
              </>
            ) : (
              <>
                <path d="M2 4.5 H16" />
                <path d="M2 9 H16" />
                <path d="M2 13.5 H16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Panel móvil */}
      {abierto && (
        <div className="absolute inset-x-0 top-full border-b border-[rgba(242,231,219,0.08)] bg-[rgba(26,21,18,0.96)] px-[6%] py-6 backdrop-blur-xl lg:hidden">
          <div className="space-y-1">
            {enlaces.map((e) =>
              e.items ? (
                <div key={e.label} className="pb-2">
                  <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-mocha/60">
                    {e.label}
                  </div>
                  {e.items.map((it) => (
                    <a
                      key={it.href}
                      href={it.href}
                      className="block rounded-xl px-2 py-2.5 text-[15px] text-sand transition-colors hover:text-clay"
                    >
                      {it.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  key={e.href}
                  href={e.href}
                  className="block rounded-xl px-2 py-2.5 text-[15px] font-medium text-sand transition-colors hover:text-clay"
                >
                  {e.label}
                </a>
              )
            )}
            <div className="pt-4 sm:hidden">
              <AgendarCTA
                label="Agenda tu diagnóstico"
                className="btn-shine block rounded-full bg-clay px-5 py-3 text-center text-sm font-semibold text-obsidian"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
