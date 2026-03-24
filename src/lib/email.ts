import { Resend } from "resend";

// Lazy-initialized to avoid crashing during build when env vars aren't set
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "noreply@yourdomain.com";
const ADMIN = process.env.ADMIN_EMAIL ?? "";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Photographer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }
}

// ─── Templates ────────────────────────────────────────────

export function bookingConfirmationEmail(data: {
  name: string;
  bookingId: string;
  sessionDate?: string;
  packageName?: string;
}) {
  return {
    to: "", // caller sets this
    subject: "Booking Request Received",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;">
        <h1 style="font-size:28px;font-weight:normal;margin-bottom:24px;">Thank you, ${data.name}.</h1>
        <p style="color:#6B6860;line-height:1.7;margin-bottom:16px;">
          I've received your booking request and will be in touch within 24 hours to confirm your session.
        </p>
        ${data.packageName ? `<p style="color:#6B6860;line-height:1.7;margin-bottom:8px;"><strong>Package:</strong> ${data.packageName}</p>` : ""}
        ${data.sessionDate ? `<p style="color:#6B6860;line-height:1.7;margin-bottom:16px;"><strong>Requested date:</strong> ${data.sessionDate}</p>` : ""}
        <div style="margin-top:32px;padding:24px;background:#F9F7F5;border-left:3px solid #C4A882;">
          <p style="font-size:13px;font-weight:bold;color:#1A1A18;margin:0 0 12px;">Payment Details</p>
          <p style="color:#6B6860;font-size:13px;line-height:1.7;margin:0 0 8px;">
            A 50% retainer is required to confirm your booking. Please use any of the following:
          </p>
          <table style="border-collapse:collapse;font-size:13px;color:#1A1A18;">
            <tr><td style="padding:4px 16px 4px 0;color:#6B6860;">CalBank</td><td style="padding:4px 0;font-weight:500;">1400008198359</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6B6860;">MTN Mobile Money</td><td style="padding:4px 0;font-weight:500;">0538523381</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6B6860;">Vodafone Cash</td><td style="padding:4px 0;font-weight:500;">0205859006</td></tr>
            <tr><td style="padding:4px 16px 4px 0;color:#6B6860;">Account Name</td><td style="padding:4px 0;font-weight:500;">Emmanuel Kissiedu</td></tr>
          </table>
        </div>
        <p style="color:#6B6860;font-size:12px;margin-top:32px;">Booking ID: ${data.bookingId}</p>
        <hr style="border:none;border-top:1px solid #E8E4DF;margin:32px 0;" />
        <p style="color:#C4A882;font-size:13px;">${ADMIN_NAME} Photography</p>
      </div>
    `,
  };
}

export function adminBookingNotificationEmail(data: {
  name: string;
  email: string;
  bookingId: string;
  packageName?: string;
  sessionDate?: string;
  notes?: string;
}) {
  return {
    to: ADMIN,
    subject: `New Booking Request from ${data.name}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;">
        <h1 style="font-size:24px;font-weight:normal;margin-bottom:24px;">New Booking Request</h1>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#6B6860;width:120px;">Name</td><td style="padding:8px 0;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#6B6860;">Email</td><td style="padding:8px 0;">${data.email}</td></tr>
          ${data.packageName ? `<tr><td style="padding:8px 0;color:#6B6860;">Package</td><td style="padding:8px 0;">${data.packageName}</td></tr>` : ""}
          ${data.sessionDate ? `<tr><td style="padding:8px 0;color:#6B6860;">Date</td><td style="padding:8px 0;">${data.sessionDate}</td></tr>` : ""}
          ${data.notes ? `<tr><td style="padding:8px 0;color:#6B6860;vertical-align:top;">Notes</td><td style="padding:8px 0;">${data.notes}</td></tr>` : ""}
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${data.bookingId}"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1A1A18;color:white;text-decoration:none;font-size:13px;letter-spacing:0.1em;">
          VIEW BOOKING
        </a>
      </div>
    `,
  };
}

export function galleryReadyEmail(data: {
  clientName: string;
  galleryTitle: string;
  gallerySlug: string;
}) {
  return {
    to: "", // caller sets this
    subject: `Your Gallery is Ready: ${data.galleryTitle}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;">
        <h1 style="font-size:28px;font-weight:normal;margin-bottom:24px;">Your gallery is ready, ${data.clientName}.</h1>
        <p style="color:#6B6860;line-height:1.7;margin-bottom:24px;">
          Your photos from <em>${data.galleryTitle}</em> are ready for you to view, select your favorites, and download.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/gallery/${data.gallerySlug}"
           style="display:inline-block;padding:14px 32px;background:#1A1A18;color:white;text-decoration:none;font-size:13px;letter-spacing:0.1em;">
          VIEW YOUR GALLERY
        </a>
        <p style="color:#6B6860;font-size:13px;margin-top:32px;line-height:1.7;">
          Log in with the email address associated with your booking. If you have any questions, just reply to this email.
        </p>
        <hr style="border:none;border-top:1px solid #E8E4DF;margin:32px 0;" />
        <p style="color:#C4A882;font-size:13px;">${ADMIN_NAME} Photography</p>
      </div>
    `,
  };
}

export function inquiryNotificationEmail(data: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  return {
    to: ADMIN,
    subject: `New ${data.type} Inquiry from ${data.name}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;">
        <h1 style="font-size:24px;font-weight:normal;margin-bottom:24px;">New ${data.type} Inquiry</h1>
        <p><strong>${data.name}</strong> — <a href="mailto:${data.email}">${data.email}</a></p>
        <p style="margin-top:16px;color:#6B6860;line-height:1.7;">${data.message}</p>
      </div>
    `,
  };
}

export function inviteEmail(data: {
  name: string;
  inviteLink: string;
  photographerName: string;
}) {
  return {
    subject: `You're invited to view your gallery: ${data.photographerName}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;background:#FAFAF9;">
        <h1 style="font-size:28px;font-weight:normal;margin-bottom:8px;">Hello, ${data.name}.</h1>
        <p style="color:#C4A882;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:32px;">
          ${data.photographerName} Photography
        </p>
        <p style="color:#6B6860;line-height:1.8;margin-bottom:16px;">
          Your gallery is ready. To access your photos, you&apos;ll first need to set a password for your account.
        </p>
        <p style="color:#6B6860;line-height:1.8;margin-bottom:32px;">
          Click the button below to create your password — it only takes a moment.
        </p>
        <a href="${data.inviteLink}"
           style="display:inline-block;padding:14px 36px;background:#1A1A18;color:#FAFAF9;text-decoration:none;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
          Set your password
        </a>
        <p style="color:#6B6860;font-size:12px;margin-top:32px;line-height:1.7;">
          This link expires in 24 hours. If you didn&apos;t expect this email, you can safely ignore it.
        </p>
        <hr style="border:none;border-top:1px solid #E8E4DF;margin:32px 0;" />
        <p style="color:#C4A882;font-size:13px;">${data.photographerName} Photography</p>
      </div>
    `,
  };
}

export function inquiryReplyEmail(data: {
  clientName: string;
  subject: string;
  replyText: string;
  photographerName: string;
}) {
  return {
    subject: `Re: ${data.subject || "Your inquiry"}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;background:#FAFAF9;">
        <p style="color:#6B6860;line-height:1.8;margin-bottom:24px;">Hi ${data.clientName},</p>
        <div style="color:#1A1A18;line-height:1.8;white-space:pre-line;margin-bottom:32px;">${data.replyText}</div>
        <p style="color:#6B6860;line-height:1.8;margin-top:8px;">Warm regards,<br><strong>${data.photographerName}</strong></p>
        <hr style="border:none;border-top:1px solid #E8E4DF;margin:32px 0;" />
        <p style="color:#C4A882;font-size:13px;">${data.photographerName} Photography</p>
      </div>
    `,
  };
}

export function passwordResetEmail(data: {
  resetLink: string;
  photographerName: string;
}) {
  return {
    subject: "Reset your password",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1A1A18;background:#FAFAF9;">
        <h1 style="font-size:28px;font-weight:normal;margin-bottom:8px;">Reset your password.</h1>
        <p style="color:#C4A882;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:32px;">
          ${data.photographerName} Photography
        </p>
        <p style="color:#6B6860;line-height:1.8;margin-bottom:16px;">
          We received a request to reset the password for your account. Click the button below to choose a new one.
        </p>
        <p style="color:#6B6860;line-height:1.8;margin-bottom:32px;">
          If you didn&apos;t request a password reset, you can safely ignore this email — your password won&apos;t change.
        </p>
        <a href="${data.resetLink}"
           style="display:inline-block;padding:14px 36px;background:#1A1A18;color:#FAFAF9;text-decoration:none;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
          Reset password
        </a>
        <p style="color:#6B6860;font-size:12px;margin-top:32px;line-height:1.7;">
          This link expires in 1 hour.
        </p>
        <hr style="border:none;border-top:1px solid #E8E4DF;margin:32px 0;" />
        <p style="color:#C4A882;font-size:13px;">${data.photographerName} Photography</p>
      </div>
    `,
  };
}
