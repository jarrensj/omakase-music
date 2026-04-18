"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  role: string;
  user_id: string;
  users: { id: string; email: string } | null;
};

type Invite = {
  id: string;
  email: string;
  created_at: string;
};

type Org = {
  id: string;
  name: string;
  slug: string;
  members: Member[];
  invites: Invite[];
};

export function ManageOrg({ org }: { org: Org }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const removeMember = async (membershipId: string) => {
    setLoading(membershipId);
    try {
      await fetch(`/api/org/${org.slug}/member/${membershipId}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    setLoading(inviteId);
    try {
      await fetch(`/api/org/${org.slug}/invite/${inviteId}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">{org.name}</h2>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Members</h3>
        <ul className="space-y-2">
          {org.members.map((member) => (
            <li key={member.id} className="flex items-center justify-between">
              <span>
                {member.users?.email || "Unknown"}{" "}
                <span className="text-gray-500 text-sm">({member.role})</span>
              </span>
              {member.role !== "owner" && (
                <button
                  onClick={() => removeMember(member.id)}
                  disabled={loading === member.id}
                  className="text-red-600 text-sm hover:underline disabled:opacity-50"
                >
                  {loading === member.id ? "..." : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {org.invites.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Pending Invites</h3>
          <ul className="space-y-2">
            {org.invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between">
                <span className="text-gray-600">{invite.email}</span>
                <button
                  onClick={() => cancelInvite(invite.id)}
                  disabled={loading === invite.id}
                  className="text-red-600 text-sm hover:underline disabled:opacity-50"
                >
                  {loading === invite.id ? "..." : "Cancel"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
