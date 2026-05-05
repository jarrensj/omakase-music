"use client";

import { useState } from "react";

export function RequestAccessButton({
  slug,
  alreadyRequested,
}: {
  slug: string;
  alreadyRequested: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(alreadyRequested);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/org/${slug}/request-access`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request access");
      }

      setRequested(true);
      setMessage("Access requested! The owner has been notified.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (requested) {
    return (
      <p className="mt-4 text-sm text-gray-600">
        Your access request is pending. The owner has been notified.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Requesting..." : "Request Access"}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
