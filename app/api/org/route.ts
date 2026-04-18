import { auth } from "@clerk/nextjs/server";
import { createOrganization } from "@/lib/org";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug } = await request.json();

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
  }

  // Validate slug format (lowercase, alphanumeric, hyphens)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
  }

  try {
    const org = await createOrganization(name, slug, userId);
    return NextResponse.json(org);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
