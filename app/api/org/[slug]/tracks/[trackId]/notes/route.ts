import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
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

  const { data: notes } = await supabase
    .from("track_notes")
    .select("*, users(email)")
    .eq("track_id", trackId)
    .order("created_at", { ascending: true });

  return NextResponse.json(notes || []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; trackId: string }> }
) {
  const { trackId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { content, startSeconds, endSeconds } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const parseSeconds = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num) || num < 0) return null;
    return num;
  };

  const start = parseSeconds(startSeconds);
  const end = parseSeconds(endSeconds);

  if (end !== null && start !== null && end < start) {
    return NextResponse.json(
      { error: "End must be after start" },
      { status: 400 }
    );
  }

  const { data: note, error } = await supabase
    .from("track_notes")
    .insert({
      content: content.trim(),
      track_id: trackId,
      author_id: user.id,
      start_seconds: start,
      end_seconds: end,
    })
    .select("*, users(email)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }

  return NextResponse.json(note);
}
