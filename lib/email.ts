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
