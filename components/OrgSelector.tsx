"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Org = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export function OrgSelector() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug?: string }>();
  const currentSlug = params?.slug;
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setOrgs(null);
      return;
    }
    let cancelled = false;
    fetch("/api/orgs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setOrgs(data);
      })
      .catch(() => {
        if (!cancelled) setOrgs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isSignedIn) return null;

  const current = orgs?.find((o) => o.slug === currentSlug);
  const label = current?.name ?? "Organizations";

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/org/${slug}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="max-w-[12rem] truncate">{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50 py-1 max-h-80 overflow-auto"
        >
          {orgs === null ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
          ) : orgs.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No organizations yet.
            </div>
          ) : (
            orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                role="option"
                aria-selected={org.slug === currentSlug}
                onClick={() => handleSelect(org.slug)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                  org.slug === currentSlug ? "bg-gray-50 font-medium" : ""
                }`}
              >
                <span className="truncate">{org.name}</span>
                <span className="ml-2 text-xs uppercase tracking-wide text-gray-500">
                  {org.role}
                </span>
              </button>
            ))
          )}
          <div className="border-t mt-1 pt-1">
            <Link
              href="/orgs"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-gray-100"
            >
              View all organizations
            </Link>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-gray-100"
            >
              Create organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
