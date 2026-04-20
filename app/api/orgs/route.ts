import { auth } from "@clerk/nextjs/server";
import { getUserOrgs } from "@/lib/org";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgs = await getUserOrgs(userId);
  return NextResponse.json(orgs);
}
