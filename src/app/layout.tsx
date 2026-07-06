import { QueryProvider } from "@/components/providers/QueryProvider";
import { ScrollRestorationDisabler } from "@/components/ScrollRestorationDisabler";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/sections/Header";
import { ReferralTracker } from "@/components/promo/ReferralTracker";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Hallos",
  description:
    "Hallos is a Creator Economy Engine where knowledge meets opportunity ....",
  icons: {
    icon: "/navIcon.png",
    shortcut: "/navIcon.png",
    apple: "/navIcon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <ScrollRestorationDisabler />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
