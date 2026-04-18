import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

async function getOrganization(slug: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganization(slug);

  if (!org) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{org.name}</h1>
      <p className="text-gray-500 mt-1">/org/{org.slug}</p>
    </main>
  );
}
