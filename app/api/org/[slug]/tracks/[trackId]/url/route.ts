import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { getDownloadUrl } from "@/lib/s3";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; trackId: string }> }
) {
  const { trackId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: track } = await supabase
    .from("tracks")
    .select("s3_key")
    .eq("id", trackId)
    .single();

  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const url = await getDownloadUrl(track.s3_key);
  return NextResponse.json({ url });
}
