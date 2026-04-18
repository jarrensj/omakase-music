import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ManageOrg } from "./manage-org";

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
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Organizations</h1>
        <p className="text-gray-500">You don't own any organizations.</p>
      </main>
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
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Organizations</h1>

      <div className="space-y-8">
        {orgsWithMembers.map((org) => (
          <ManageOrg key={org.id} org={org} />
        ))}
      </div>
    </main>
  );
}
