import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ManageOrg } from "./manage-org";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

async function getUserOwnedOrgs(clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const { data: orgs } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id);

  return orgs || [];
}

async function getOrgMembers(orgId: string) {
  const { data } = await supabase
    .from("org_memberships")
    .select("id, role, user_id, users(id, email)")
    .eq("org_id", orgId);

  return data || [];
}

async function getPendingInvites(orgId: string) {
  const { data } = await supabase
    .from("org_invites")
    .select("id, email, created_at")
    .eq("org_id", orgId);

  return data || [];
}

export default async function ManagePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const orgs = await getUserOwnedOrgs(userId);

  if (orgs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Organizations</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">You don't own any organizations yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create an organization from the home page to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orgsWithMembers = await Promise.all(
    orgs.map(async (org) => ({
      ...org,
      members: await getOrgMembers(org.id),
      invites: await getPendingInvites(org.id),
    }))
  );

  return (
    <div className="container max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Manage Organizations</h1>

      <div className="space-y-6">
        {orgsWithMembers.map((org) => (
          <ManageOrg key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}
