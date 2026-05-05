"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AccessRequest = {
  id: string;
  created_at: string;
  users: { id: string; email: string } | { id: string; email: string }[] | null;
};

export function RequestList({
  slug,
  requests,
}: {
  slug: string;
  requests: AccessRequest[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    requestId: string,
    action: "approve" | "deny"
  ) => {
    setLoading(requestId);
    try {
      await fetch(`/api/org/${slug}/requests/${requestId}`, {
        method: action === "approve" ? "POST" : "DELETE",
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <ul className="space-y-2">
      {requests.map((req) => {
        const user = Array.isArray(req.users) ? req.users[0] : req.users;
        const email = user?.email || "Unknown";
        const isLoading = loading === req.id;

        return (
          <li
            key={req.id}
            className="border rounded-md p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{email}</p>
              <p className="text-xs text-gray-500">
                Requested {new Date(req.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(req.id, "approve")}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? "..." : "Approve"}
              </button>
              <button
                onClick={() => handleAction(req.id, "deny")}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoading ? "..." : "Deny"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
