import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InviteForm } from "./invite-form";
import { UploadForm } from "./upload-form";
import { TrackList } from "./track-list";
import { RequestAccessButton } from "./request-access-button";

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

async function hasPendingRequest(orgId: string, clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return false;

  const { data } = await supabase
    .from("org_access_requests")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  return Boolean(data);
}

async function getPendingRequestCount(orgId: string) {
  const { count } = await supabase
    .from("org_access_requests")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  return count ?? 0;
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
    const alreadyRequested = userId
      ? await hasPendingRequest(org.id, userId)
      : false;

    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-gray-500 mt-1">/org/{org.slug}</p>
        <p className="mt-4 text-red-600">You are not a member of this organization.</p>
        {userId && (
          <RequestAccessButton slug={slug} alreadyRequested={alreadyRequested} />
        )}
      </main>
    );
  }

  const tracks = await getTracks(org.id);
  const pendingRequestCount = isOwner ? await getPendingRequestCount(org.id) : 0;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{org.name}</h1>
      <p className="text-gray-500 mt-1">/org/{org.slug}</p>
      <p className="mt-2 text-green-600">You are a {membership.role} of this organization.</p>

      {isOwner && (
        <>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Invite Member</h2>
            <InviteForm slug={slug} />
          </div>
          <div className="mt-4">
            <Link
              href={`/org/${slug}/requests`}
              className="text-sm underline"
            >
              Pending access requests
              {pendingRequestCount > 0 && ` (${pendingRequestCount})`}
            </Link>
          </div>
        </>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Upload Track</h2>
        <UploadForm slug={slug} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Tracks</h2>
        <TrackList tracks={tracks} slug={slug} />
      </div>
    </main>
  );
}
