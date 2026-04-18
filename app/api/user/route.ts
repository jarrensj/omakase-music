import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const dbUser = await getOrCreateUser(userId, email);
  return NextResponse.json(dbUser);
}
