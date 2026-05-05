import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { RequestList } from "./request-list";

async function getOrganization(slug: string) {
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  return data;
}

async function getAccessRequests(orgId: string) {
  const { data } = await supabase
    .from("org_access_requests")
    .select("id, created_at, users(id, email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function RequestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const org = await getOrganization(slug);

  if (!org) {
    notFound();
  }

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user || user.id !== org.owner_id) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="mt-4 text-red-600">
          Only the owner can review access requests.
        </p>
      </main>
    );
  }

  const requests = await getAccessRequests(org.id);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href={`/org/${slug}`} className="text-sm underline">
        &larr; Back to {org.name}
      </Link>
      <h1 className="text-3xl font-bold mt-2">Access Requests</h1>
      <p className="text-gray-500 mt-1">{org.name}</p>

      <div className="mt-6">
        {requests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <RequestList slug={slug} requests={requests} />
        )}
      </div>
    </main>
  );
}
