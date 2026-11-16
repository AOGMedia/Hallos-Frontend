"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Settings, User2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NAV_PANEL_CARD } from "@/components/nav/NavMegaPanel";
import type { User } from "@/types/auth";
import { signOutFromHeader } from "./signOut";

export const displayNameOf = (user: User) =>
  `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || user.email || "Your account";

const MENU_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: User2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-text-primary transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none";

/** Neutral stand-in while a saved login is confirmed — never "Log In". */
export function AccountPlaceholder({ withButton = false }: { withButton?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      {withButton && <span className="h-10 w-[120px] animate-pulse rounded-full bg-white/10" />}
      <span className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

/** Desktop: "Dashboard" button plus the avatar, which opens the account menu. */
export function DesktopAccount({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const name = displayNameOf(user);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard">
        <Button variant="primary" size="sm" className="lg:px-6 lg:py-3">
          Dashboard
        </Button>
      </Link>

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Account menu for ${name}`}
          className="flex rounded-full outline-none ring-offset-2 ring-offset-black transition-shadow hover:ring-2 hover:ring-primary/60 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Avatar src={user.avatarUrl} alt={name} size="md" twoInitials />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`absolute right-0 top-full mt-3 w-72 p-2 ${NAV_PANEL_CARD}`}
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar src={user.avatarUrl} alt={name} size="md" twoInitials />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
                  {user.email && <p className="truncate text-xs text-text-muted">{user.email}</p>}
                </div>
              </div>
              <div className="my-1 h-px bg-border" />
              {MENU_LINKS.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                  <Icon size={18} className="text-text-muted" aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <div className="my-1 h-px bg-border" />
              <button type="button" role="menuitem" onClick={() => void signOutFromHeader()} className={itemClass}>
                <LogOut size={18} className="text-text-muted" aria-hidden="true" />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Phone top bar: the avatar goes straight to the dashboard. */
export function MobileAvatarLink({ user }: { user: User }) {
  const name = displayNameOf(user);
  return (
    <Link
      href="/dashboard"
      aria-label={`Go to your dashboard, ${name}`}
      className="flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Avatar src={user.avatarUrl} alt={name} size="sm" twoInitials />
    </Link>
  );
}

/** Phone menu: who's signed in, "Go to dashboard", and sign out. */
export function MobileAccountCard({ user, onNavigate }: { user: User; onNavigate: () => void }) {
  const name = displayNameOf(user);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={user.avatarUrl} alt={name} size="md" twoInitials />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">{name}</p>
          {user.email && <p className="truncate text-xs text-text-muted">{user.email}</p>}
        </div>
      </div>
      <Link href="/dashboard" onClick={onNavigate}>
        <Button variant="primary" size="sm" className="w-full">
          Go to dashboard
        </Button>
      </Link>
      <button
        type="button"
        onClick={() => void signOutFromHeader()}
        className="flex min-h-11 items-center justify-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}
