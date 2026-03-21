/**
 * Google Calendar integration via service account.
 * Creates/deletes events when bookings are confirmed/cancelled.
 */

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

/** Get a Google OAuth2 access token via JWT service account (edge-compatible) */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: CLIENT_EMAIL,
    scope: SCOPES.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const input = `${headerB64}.${payloadB64}`;

  // Import RSA private key
  const pemContents = PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const keyBuffer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(input)
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(signBuffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${input}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const { access_token } = await tokenRes.json();
  return access_token;
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;
  attendeeEmail?: string;
}

/** Create a Google Calendar event and return its ID */
export async function createCalendarEvent(
  event: CalendarEventInput
): Promise<string | null> {
  try {
    const token = await getAccessToken();
    const body = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startDateTime, timeZone: "America/New_York" },
      end: { dateTime: event.endDateTime, timeZone: "America/New_York" },
      attendees: event.attendeeEmail
        ? [{ email: event.attendeeEmail }]
        : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 1440 }, // 24h
          { method: "popup", minutes: 60 },
        ],
      },
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

/** Delete a Google Calendar event */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const token = await getAccessToken();
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch {
    // Deletion failure is non-fatal — event may already be removed
  }
}

/** Fetch booked/blocked date ranges for the availability calendar */
export async function getBlockedDates(
  timeMin: string,
  timeMax: string
): Promise<{ start: string; end: string }[]> {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "100",
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    return (data.items ?? []).map(
      (e: { start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string } }) => ({
        start: e.start.date ?? e.start.dateTime ?? "",
        end: e.end.date ?? e.end.dateTime ?? "",
      })
    );
  } catch {
    return [];
  }
}
