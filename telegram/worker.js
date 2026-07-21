/**
 * Telegram → GitHub bridge (Cloudflare Worker).
 *
 * Lets you run the rate-verification workflow from Telegram by sending /verify.
 * Telegram delivers each message to this Worker's URL (webhook); the Worker
 * checks it's from the authorised chat, then calls GitHub's workflow_dispatch.
 * The workflow's own Telegram step sends the report back when it finishes.
 *
 * Event-driven (no polling). Secrets live in the Worker, never in the repo:
 *   BOT_TOKEN  — Telegram bot token (from BotFather)
 *   CHAT_ID    — your Telegram chat id (only this chat may command the bot)
 *   GH_PAT     — GitHub fine-grained PAT, Actions:write on this one repo
 *   GH_REPO    — "owner/repo", e.g. "trilumos/calcyourfinance"
 *   WORKFLOW   — workflow file name, e.g. "rate-verify.yml"
 *   REF        — branch to run on, e.g. "main"
 *   WEBHOOK_SECRET — matched against Telegram's secret_token header (anti-spoof)
 */
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("ok"); // health check
    if (
      env.WEBHOOK_SECRET &&
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET
    ) {
      return new Response("forbidden", { status: 403 });
    }

    const update = await request.json().catch(() => null);
    const msg = update?.message ?? update?.edited_message;
    const chatId = msg?.chat?.id;
    // Only the owner's chat may drive the bot; ignore everyone else silently.
    if (!chatId || String(chatId) !== String(env.CHAT_ID)) return new Response("ok");

    const text = (msg.text ?? "").trim().split("@")[0].toLowerCase();

    if (text === "/verify" || text === "/run") {
      const ok = await dispatch(env);
      await send(
        env,
        chatId,
        ok
          ? "▶️ Rate verification started. I'll send the report here when it finishes (~2 min)."
          : "⚠️ Couldn't start the run — check the Worker's GH_PAT / GH_REPO / WORKFLOW settings.",
      );
    } else if (text === "/start" || text === "/help") {
      await send(
        env,
        chatId,
        "CalcYourFinance rate watcher.\n\n/verify — run the check now\n/help — this message\n\nAuto-runs Mondays 06:00 UTC. Reports arrive here.",
      );
    }
    return new Response("ok");
  },
};

async function dispatch(env) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GH_REPO}/actions/workflows/${env.WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GH_PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cyf-rate-verify-bot",
      },
      body: JSON.stringify({ ref: env.REF || "main" }),
    },
  );
  return res.status === 204; // GitHub returns 204 No Content on success
}

async function send(env, chatId, text) {
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
