import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { requestOrgAccess } from "@/lib/org";
import { sendAccessRequestEmail } from "@/lib/email";
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

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, owner_id")
    .eq("slug", slug)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { data: requester } = await supabase
    .from("users")
    .select("id, email")
    .eq("clerk_id", userId)
    .single();

  if (!requester) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (requester.id === org.owner_id) {
    return NextResponse.json({ error: "You own this organization" }, { status: 400 });
  }

  try {
    const accessRequest = await requestOrgAccess(org.id, userId);

    const { data: owner } = await supabase
      .from("users")
      .select("email")
      .eq("id", org.owner_id)
      .single();

    if (owner?.email && requester.email) {
      const baseUrl = new URL(request.url).origin;
      try {
        await sendAccessRequestEmail(
          owner.email,
          org.name,
          org.slug,
          requester.email,
          baseUrl
        );
      } catch (emailError) {
        console.error("Failed to send access request email:", emailError);
      }
    }

    return NextResponse.json(accessRequest);
  } catch (error) {
    console.error("Failed to request access:", error);
    const message = error instanceof Error ? error.message : "Failed to request access";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
