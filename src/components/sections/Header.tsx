"use client"
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import SearchIcon from "@/components/icons/SearchIcon";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  
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

        <div className="hidden lg:flex flex-1 max-w-md">
          <div className="glass-effect bg-[#1F2636]! rounded-lg w-full">
            <Input
              placeholder="Search"
              icon={<SearchIcon width={20} height={20} color="#F2F2F2" />}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 lg:gap-10">
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
              {/* Mobile Search */}
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
