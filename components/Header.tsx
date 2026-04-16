"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoPlaceholder from "./LogoPlaceholder";

const navItems = [
  { label: "方法", href: "#method" },
  { label: "案例", href: "#platforms" },
  { label: "关于", href: "#about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-6 md:px-20 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <LogoPlaceholder size={36} />
          <span className="font-['Instrument_Serif',serif] text-2xl tracking-[0.15em] text-text-primary">
            ORIGENO
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-text-secondary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="#diagnosis"
          className="hidden md:inline-block text-sm tracking-wide text-text-secondary border border-border rounded-md px-5 py-2"
        >
          免费诊断
        </a>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-text-primary"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-bg-primary border-t border-border">
          <nav className="flex flex-col px-6 py-6 gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-base text-text-secondary"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#diagnosis"
              className="text-sm text-text-secondary border border-border rounded-md px-5 py-2 text-center"
              onClick={() => setMenuOpen(false)}
            >
              免费诊断
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
