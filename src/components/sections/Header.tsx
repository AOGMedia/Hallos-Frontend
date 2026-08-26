"use client"
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import SearchIcon from "@/components/icons/SearchIcon";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Newspaper, CalendarDays, ArrowUpRight } from "lucide-react";

interface CompanyLink {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const COMPANY_LINKS: CompanyLink[] = [
  {
    label: "Blog",
    description: "Stories, product updates, and ideas from the team",
    href: "/blog",
    icon: Newspaper,
  },
  {
    label: "Events",
    description: "Live sessions, cohorts, and community meetups",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const companyContainerRef = useRef<HTMLDivElement>(null);

  // Close the search field and company dropdown on an outside click, and the
  // dropdown on Escape — both are transient overlays, not persistent nav state.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (companyContainerRef.current && !companyContainerRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCompanyOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isAuthRoute = pathname==="/signin" || pathname==="/signup" || pathname.startsWith("/dashboard")|| pathname.startsWith("/live")|| pathname.startsWith("/not-found")|| pathname.startsWith("/payments")|| pathname.startsWith("/series")|| pathname.startsWith("/series/")||pathname.startsWith("/admin")||pathname.startsWith("/campaign/");

  const isCourseRoute = pathname.startsWith("/course");

  if (isAuthRoute || (isCourseRoute && user)) {
    return null; // Don't render the header on dashboard, auth, and course pages (for logged-in users)
  }
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000] backdrop-blur-lg border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4 lg:gap-8">
        <Link href="/">
          <Image
            src="/transparentlogo.svg"
            alt="Learning247"
            width={120}
            height={30}
            className="flex-shrink-0 lg:w-[183px] lg:h-[45px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 lg:gap-10 ml-auto">
          <Link
            href="/"
            className="text-nav hover:text-accent-cyan transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard/classes"
            className="text-nav hover:text-accent-cyan transition-colors"
          >
            Classes
          </Link>
          <Link
            href="/course"
            prefetch={false}
            className="hidden xl:block text-nav hover:text-accent-cyan transition-colors"
          >
            {" "}
          Self-Paced Courses
          </Link>

          {/* Company mega-panel */}
          <div ref={companyContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setCompanyOpen((open) => !open)}
              aria-expanded={companyOpen}
              className="flex items-center gap-1 text-nav hover:text-accent-cyan transition-colors"
            >
              Company
              <ChevronDown
                size={16}
                className={`transition-transform ${companyOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {companyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-4 w-[min(420px,calc(100vw-2.5rem))] rounded-2xl border border-border bg-[#0d0f18]/95 backdrop-blur-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] overflow-hidden"
                >
                  {/* Ambient accent glow — signals "crafted" rather than a plain list */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-16 w-56 h-56 rounded-full opacity-25 blur-3xl"
                    style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
                  />

                  <div className="relative flex flex-col min-[380px]:grid min-[380px]:grid-cols-[1fr_auto]">
                    {/* Link column */}
                    <div className="p-3">
                      <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/70">
                        Company
                      </p>
                      <div className="flex flex-col gap-1">
                        {COMPANY_LINKS.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setCompanyOpen(false)}
                              className="group flex items-start gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06]"
                            >
                              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 border border-border text-accent-cyan transition-colors group-hover:bg-accent-cyan/10 group-hover:border-accent-cyan/30">
                                <Icon size={18} />
                              </span>
                              <span className="min-w-0 pt-0.5">
                                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-text-primary">
                                  {item.label}
                                  <ArrowUpRight
                                    size={14}
                                    className="text-text-secondary/50 opacity-0 -translate-x-0.5 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                                  />
                                </span>
                                <span className="block text-[13px] leading-snug text-text-secondary/80 mt-0.5">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Highlight rail — gives the wider surface real content
                        instead of stretching two links across empty space */}
                    <div className="min-[380px]:w-[168px] border-t min-[380px]:border-t-0 min-[380px]:border-l border-border bg-white/[0.02] p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary/70 mb-2">
                          Featured
                        </p>
                        <p className="text-[13px] leading-snug text-text-primary font-medium">
                          Live sessions run every week
                        </p>
                        <p className="text-[12px] leading-snug text-text-secondary/70 mt-1">
                          See what&apos;s coming up next.
                        </p>
                      </div>
                      <Link
                        href="/dashboard/events"
                        onClick={() => setCompanyOpen(false)}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-cyan hover:underline mt-4"
                      >
                        View events <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search toggle */}
          <div ref={searchContainerRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Open search"}
              className="p-1.5 text-[#f2f2f2] hover:text-accent-cyan transition-colors"
            >
              {searchOpen ? <X size={20} /> : <SearchIcon width={20} height={20} color="currentColor" />}
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 260 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-3 overflow-hidden"
                >
                  <div className="glass-effect bg-[#1F2636]! rounded-lg w-[260px]">
                    <Input
                      autoFocus
                      placeholder="Search"
                      icon={<SearchIcon width={20} height={20} color="#F2F2F2" />}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="w-px h-5 bg-border" />
          <Link
            href="/signin"
            className="text-nav hover:text-accent-cyan transition-colors text-sm lg:text-base"
          >
            Log In
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm" className="lg:px-6 lg:py-3">
              Sign Up
            </Button>
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#f2f2f2] hover:text-accent-cyan transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-[#000000] border-t border-border"
          >
            <motion.nav
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col px-4 py-4 space-y-4"
            >
              {/* Mobile Search — always visible on the mobile menu, no toggle
                  needed since the menu itself is already an explicit action */}
              <div className="glass-effect bg-[#1F2636]! rounded-lg w-full">
                <Input
                  placeholder="Search"
                  icon={<SearchIcon width={20} height={20} color="#F2F2F2" />}
                />
              </div>

              {/* Mobile Navigation Links */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-nav hover:text-accent-cyan transition-colors py-2"
              >
                Home
              </Link>
              <Link
                href="/dashboard/classes"
                onClick={() => setMobileMenuOpen(false)}
                className="text-nav hover:text-accent-cyan transition-colors py-2"
              >
                Classes
              </Link>
              <Link
                href="/course"
                onClick={() => setMobileMenuOpen(false)}
                prefetch={false}
                className="text-nav hover:text-accent-cyan transition-colors py-2"
              >
                Self-Paced Courses
              </Link>

              {/* Company links, flattened for mobile rather than nested
                  behind a second dropdown-in-a-dropdown */}
              <div className="pt-1">
                <span className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Company
                </span>
                <div className="flex flex-col space-y-3 pl-2">
                  {COMPANY_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-nav hover:text-accent-cyan transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border my-2" />

              {/* Mobile Auth Buttons */}
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-nav hover:text-accent-cyan transition-colors py-2 text-center"
              >
                Log In
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
