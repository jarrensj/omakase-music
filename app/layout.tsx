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
import { Button } from "@/components/ui/button";
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
            <div className="container flex h-14 items-center justify-between px-4">
              <Link href="/" className="font-semibold tracking-tight">
                omakase music
              </Link>
              <div className="flex items-center gap-2">
                <Show when="signed-out">
                  <SignInButton>
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="sm">Sign up</Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <SyncUser />
                  <Link href="/manage">
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
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
