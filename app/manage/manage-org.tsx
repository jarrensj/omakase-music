"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserMinus, X, Clock, Users, Mail } from "lucide-react";
import Link from "next/link";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{org.name}</CardTitle>
            <CardDescription className="mt-1">
              <Link
                href={`/org/${org.slug}`}
                className="hover:underline"
              >
                /org/{org.slug}
              </Link>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {org.members.length}
            </Badge>
            {org.invites.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {org.invites.length} pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {org.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.users?.email || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.role === "owner" ? "default" : "secondary"}
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          disabled={loading === member.id}
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {loading === member.id ? (
                            "..."
                          ) : (
                            <>
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {org.invites.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Invites
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {invite.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invite.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvite(invite.id)}
                            disabled={loading === invite.id}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {loading === invite.id ? (
                              "..."
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
