"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function SyncUser() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user");
    }
  }, [isSignedIn]);

  return null;
}
