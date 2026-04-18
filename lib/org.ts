import { supabase } from "./supabase";

export async function createOrganization(
  name: string,
  slug: string,
  clerkId: string
) {
  // Get the database user id from clerk_id
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) throw new Error("User not found");

  // Create the organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug, owner_id: user.id })
    .select()
    .single();

  if (orgError) throw orgError;

  return org;
}
