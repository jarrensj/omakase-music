import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

async function authorizeOwner(slug: string, clerkId: string) {
  const { data: org } = await supabase
    .from("organizations")
    .select("id, owner_id")
    .eq("slug", slug)
    .single();

  if (!org) return { error: "Organization not found", status: 404 as const };

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user || org.owner_id !== user.id) {
    return { error: "Only owners can manage requests", status: 403 as const };
  }

  return { org };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; requestId: string }> }
) {
  const { slug, requestId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await authorizeOwner(slug, userId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { org } = result;

  const { data: accessRequest } = await supabase
    .from("org_access_requests")
    .select("id, user_id")
    .eq("id", requestId)
    .eq("org_id", org.id)
    .single();

  if (!accessRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Add the user as a member
  const { error: membershipError } = await supabase
    .from("org_memberships")
    .insert({
      user_id: accessRequest.user_id,
      org_id: org.id,
      role: "member",
    });

  if (membershipError && membershipError.code !== "23505") {
    return NextResponse.json({ error: "Failed to approve request" }, { status: 500 });
  }

  await supabase
    .from("org_access_requests")
    .delete()
    .eq("id", requestId);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; requestId: string }> }
) {
  const { slug, requestId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await authorizeOwner(slug, userId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { error } = await supabase
    .from("org_access_requests")
    .delete()
    .eq("id", requestId)
    .eq("org_id", result.org.id);

  if (error) {
    return NextResponse.json({ error: "Failed to deny request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
