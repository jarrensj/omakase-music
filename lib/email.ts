import { Resend } from "resend";

export async function sendInviteEmail(
  email: string,
  orgName: string,
  inviterEmail: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev",
    to: email,
    cc: inviterEmail,
    subject: `You've been invited to ${orgName}`,
    html: `<p>You've been invited to join ${orgName} on omakase music.</p>`,
  });

  if (error) throw error;
}

export async function sendAccessRequestEmail(
  ownerEmail: string,
  orgName: string,
  orgSlug: string,
  requesterEmail: string,
  baseUrl: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const requestsUrl = `${baseUrl}/org/${orgSlug}/requests`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev",
    to: ownerEmail,
    subject: `${requesterEmail} requested access to ${orgName}`,
    html: `<p><strong>${requesterEmail}</strong> has requested access to <strong>${orgName}</strong> on omakase music.</p>
<p><a href="${requestsUrl}">Review pending requests</a> to approve or deny.</p>`,
  });

  if (error) throw error;
}

export async function sendAccessApprovedEmail(
  userEmail: string,
  orgName: string,
  orgSlug: string,
  baseUrl: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const orgUrl = `${baseUrl}/org/${orgSlug}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev",
    to: userEmail,
    subject: `You now have access to ${orgName}`,
    html: `<p>Your request to join <strong>${orgName}</strong> on omakase music has been approved.</p>
<p><a href="${orgUrl}">View ${orgName}</a></p>`,
  });

  if (error) throw error;
}
