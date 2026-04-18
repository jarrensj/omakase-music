import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { inviteToOrg } from "@/lib/org";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
    return NextResponse.json({ error: "Only owners can invite" }, { status: 403 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const invite = await inviteToOrg(org.id, email, userId);
    return NextResponse.json(invite);
  } catch (error) {
    return NextResponse.json({ error: "Failed to invite" }, { status: 500 });
  }
}
