"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export function InviteForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch(`/api/org/${slug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite");
      }

      setEmail("");
      setStatus("success");
      setMessage("Invite sent!");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
          className="pr-10"
        />
        {status !== "idle" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
          "Sending..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Invite
          </>
        )}
      </Button>
      {message && (
        <span
          className={`self-center text-sm ${
            status === "success" ? "text-green-600" : "text-destructive"
          }`}
        >
          {message}
        </span>
      )}
    </form>
  );
}
