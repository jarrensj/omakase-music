import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getUploadUrl } from "@/lib/s3";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get org
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { filename, contentType } = await request.json();
  const key = `${org.id}/${randomUUID()}-${filename}`;
  const uploadUrl = await getUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key, orgId: org.id });
}
