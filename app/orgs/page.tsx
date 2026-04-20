import { auth } from "@clerk/nextjs/server";
import { getUserOrgs } from "@/lib/org";
import { redirect } from "next/navigation";
import Link from "next/link";

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
