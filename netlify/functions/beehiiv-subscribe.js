export default async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    console.error("Missing Beehiiv environment variables.");
    return new Response(JSON.stringify({ error: "Newsletter service is not configured yet." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const username = String(body?.username || "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!username) {
    return new Response(JSON.stringify({ error: "Your Archive username is required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const beehiivResponse = await fetch(
    `https://api.beehiiv.com/v2/publications/${encodeURIComponent(publicationId)}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: false,
        double_opt_override: "on",
        referring_site: "https://andromedaarchiveonline.netlify.app/",
        utm_source: "andromeda_archive",
        utm_medium: "website",
        utm_campaign: "archive_subscription",
        custom_fields: [
          { name: "Archive Username", value: username },
        ],
      }),
    },
  );

  const responseText = await beehiivResponse.text();
  let responseData = null;
  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseData = null;
  }

  if (!beehiivResponse.ok) {
    console.error("Beehiiv subscription failed", {
      status: beehiivResponse.status,
      body: responseText,
    });

    let message = "We couldn't start your subscription. Please try again.";
    if (beehiivResponse.status === 401) message = "Newsletter authentication is not configured correctly.";
    else if (beehiivResponse.status === 404) message = "Newsletter publication could not be found.";
    else if (beehiivResponse.status === 429) message = "Too many subscription attempts. Please try again in a moment.";
    else if (responseData?.message) message = responseData.message;
    else if (responseData?.error) message = responseData.error;

    return new Response(JSON.stringify({ error: message }), {
      status: beehiivResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    ok: true,
    status: responseData?.data?.status || "validating",
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};
