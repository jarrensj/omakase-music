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

  // Add owner as member
  await supabase
    .from("org_memberships")
    .insert({ user_id: user.id, org_id: org.id, role: "owner" });

  return org;
}

export async function inviteToOrg(orgId: string, email: string, invitedByClerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", invitedByClerkId)
    .single();

  if (!user) throw new Error("User not found");

  // Check if already invited
  const { data: existing } = await supabase
    .from("org_invites")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    throw new Error("Email already invited");
  }

  const { data, error } = await supabase
    .from("org_invites")
    .insert({ org_id: orgId, email: email.toLowerCase(), invited_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function requestOrgAccess(orgId: string, clerkId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) throw new Error("User not found");

  // Don't allow requests if already a member
  const { data: existingMembership } = await supabase
    .from("org_memberships")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (existingMembership) {
    throw new Error("Already a member");
  }

  // Don't allow duplicate requests
  const { data: existing } = await supabase
    .from("org_access_requests")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    throw new Error("Access already requested");
  }

  const { data, error } = await supabase
    .from("org_access_requests")
    .insert({ org_id: orgId, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acceptPendingInvites(clerkId: string, email: string) {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return;

  // Find pending invites for this email
  const { data: invites } = await supabase
    .from("org_invites")
    .select("*")
    .eq("email", email.toLowerCase());

  if (!invites || invites.length === 0) return;

  // Add user to each org
  for (const invite of invites) {
    await supabase
      .from("org_memberships")
      .insert({ user_id: user.id, org_id: invite.org_id, role: "member" });

    // Delete the invite
    await supabase
      .from("org_invites")
      .delete()
      .eq("id", invite.id);
  }
}
