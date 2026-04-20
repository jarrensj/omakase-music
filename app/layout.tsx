import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import { SyncUser } from "@/components/SyncUser";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "omakase music",
  description: "omakase music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <ClerkProvider>
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between max-w-4xl mx-auto px-4 w-full">
              <Link href="/" className="font-semibold tracking-tight">
                omakase music
              </Link>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton>
                    <button className="text-sm font-medium hover:text-foreground/80 transition-colors">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <SyncUser />
                  <Link
                    href="/manage"
                    className="text-sm font-medium hover:text-foreground/80 transition-colors"
                  >
                    Manage
                  </Link>
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
