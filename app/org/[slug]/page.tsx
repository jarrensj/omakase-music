import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { InviteForm } from "./invite-form";
import { UploadForm } from "./upload-form";
import { TrackList } from "./track-list";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

async function getOrganization(slug: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

async function getUserMembership(orgId: string, orgOwnerId: string, clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return null;

  // Check if user is owner (for orgs created before memberships)
  if (user.id === orgOwnerId) {
    return { role: "owner" };
  }

  const { data: membership } = await supabase
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  return membership;
}

async function getTracks(orgId: string) {
  const { data } = await supabase
    .from("tracks")
    .select("*, users(email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();
  const org = await getOrganization(slug);

  if (!org) {
    notFound();
  }

  const membership = userId ? await getUserMembership(org.id, org.owner_id, userId) : null;
  const isOwner = membership?.role === "owner";

  if (!membership) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>{org.name}</CardTitle>
            </div>
            <CardDescription>/org/{org.slug}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              You are not a member of this organization.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tracks = await getTracks(org.id);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {membership.role}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">/org/{org.slug}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite Member</CardTitle>
              <CardDescription>
                Send an invitation to add someone to your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm slug={slug} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Track</CardTitle>
            <CardDescription>
              Upload an audio file to share with your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm slug={slug} />
          </CardContent>
        </Card>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Tracks {tracks.length > 0 && <span className="text-muted-foreground font-normal">({tracks.length})</span>}
          </h2>
          <TrackList tracks={tracks} slug={slug} />
        </div>
      </div>
    </div>
  );
}
