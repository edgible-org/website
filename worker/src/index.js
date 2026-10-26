// The contact form's back end: checks Turnstile, then emails the message to TO_ADDRESS.

const MAX = { name: 120, email: 254, topic: 60, message: 5000 };
const TOPICS = ["Small business or club", "Family or home", "Investing or partnering", "Press", "A playbook or card", "Help with Edgible", "Something else"];

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };
    const reply = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, { ok: false, error: "Use POST." });
    if (request.headers.get("Origin") !== env.ALLOWED_ORIGIN) return reply(403, { ok: false, error: "Not allowed." });

    let form;
    try { form = await request.formData(); } catch { return reply(400, { ok: false, error: "Could not read the form." }); }
    const field = (k) => String(form.get(k) ?? "").trim();

    // A person never fills the hidden "website" field; pretend success to a bot.
    if (field("website")) return reply(200, { ok: true });

    const name = field("name");
    const email = field("email");
    const topic = field("topic");
    const message = field("message");

    if (!name || name.length > MAX.name) return reply(400, { ok: false, error: "Please tell us your name." });
    if (email.length > MAX.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { ok: false, error: "That email address does not look right." });
    if (!TOPICS.includes(topic)) return reply(400, { ok: false, error: "Please choose a topic." });
    if (!message || message.length > MAX.message) return reply(400, { ok: false, error: "Please write a message (up to 5000 characters)." });

    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: field("cf-turnstile-response"),
        remoteip: request.headers.get("CF-Connecting-IP") ?? "",
      }),
    });
    const verdict = await check.json().catch(() => ({}));
    // The token must have been issued to the contact form on our own page.
    if (!verdict.success || verdict.action !== "contact" || verdict.hostname !== env.EXPECTED_HOSTNAME) {
      console.log("turnstile rejected", JSON.stringify({ codes: verdict["error-codes"], action: verdict.action, hostname: verdict.hostname, http: check.status, hasSecret: Boolean(env.TURNSTILE_SECRET) }));
    }
    if (!verdict.success || verdict.action !== "contact" || verdict.hostname !== env.EXPECTED_HOSTNAME) {
      return reply(400, { ok: false, error: "The spam check did not pass. Please try again." });
    }

    const oneLine = (s) => s.replace(/[\r\n]+/g, " ");
    try {
      await env.EMAIL.send({
        to: env.TO_ADDRESS,
        from: { email: env.FROM_ADDRESS, name: "edgible.ai contact form" },
        replyTo: { email, name: oneLine(name) },
        subject: `[edgible.ai] ${topic}: ${oneLine(name)}`,
        text: `From: ${oneLine(name)} <${email}>\nTopic: ${topic}\n\n${message}\n`,
      });
    } catch (e) {
      console.log("send failed", e.code, e.message);
      return reply(502, { ok: false, error: "We could not send that just now. Please email contact@edgible.com instead." });
    }
    return reply(200, { ok: true });
  },
};
