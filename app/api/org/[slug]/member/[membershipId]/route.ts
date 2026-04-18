import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; membershipId: string }> }
) {
  const { slug, membershipId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get org by slug
  const { data: org } = await supabase
    .from("organizations")
    .select("id, owner_id")
    .eq("slug", slug)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Check if user is owner
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user || org.owner_id !== user.id) {
    return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
  }

  // Delete membership
  const { error } = await supabase
    .from("org_memberships")
    .delete()
    .eq("id", membershipId)
    .eq("org_id", org.id);

  if (error) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
