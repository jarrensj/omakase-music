import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getUserOrgs(clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return [];

  const { data: memberships } = await supabase
    .from("org_memberships")
    .select("role, organizations(id, name, slug)")
    .eq("user_id", user.id);

  const fromMemberships = (memberships || [])
    .map((m) => {
      const org = Array.isArray(m.organizations)
        ? m.organizations[0]
        : m.organizations;
      if (!org) return null;
      return {
        id: org.id as string,
        name: org.name as string,
        slug: org.slug as string,
        role: m.role as string,
      };
    })
    .filter((o): o is { id: string; name: string; slug: string; role: string } => o !== null);

  // Include orgs the user owns but doesn't have a membership row for
  // (legacy orgs created before memberships existed).
  const { data: ownedOrgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("owner_id", user.id);

  const seen = new Set(fromMemberships.map((o) => o.id));
  const ownedOnly = (ownedOrgs || [])
    .filter((o) => !seen.has(o.id))
    .map((o) => ({ ...o, role: "owner" as const }));

  return [...fromMemberships, ...ownedOnly].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export default async function OrgsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const orgs = await getUserOrgs(userId);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Organizations</h1>

      {orgs.length === 0 ? (
        <p className="text-gray-500">
          You're not in any organizations yet.{" "}
          <Link href="/" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {orgs.map((org) => (
            <li
              key={org.id}
              className="border rounded-md p-4 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/org/${org.slug}`}
                  className="font-semibold hover:underline"
                >
                  {org.name}
                </Link>
                <p className="text-sm text-gray-500">/org/{org.slug}</p>
              </div>
              <span className="text-xs uppercase tracking-wide text-gray-600 border rounded px-2 py-1">
                {org.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
