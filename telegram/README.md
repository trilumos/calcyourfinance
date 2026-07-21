# Telegram control for the rate watcher

Two independent pieces:

1. **Report → Telegram** — the GitHub workflow sends the report + a weekly
   reminder to your chat. Needs two **GitHub Actions secrets**.
2. **Telegram → GitHub** — the Cloudflare Worker in this folder lets you run the
   workflow by sending `/verify`. Needs a **GitHub PAT** + **Worker secrets**.

Your values (already known):

| | value |
|---|---|
| Chat ID | `5597392397` |
| Repo | `trilumos/calcyourfinance` |
| Workflow | `rate-verify.yml` |
| Bot | `@cyf_rate_verifybot` |

The bot **token** is not written anywhere in this repo — keep it only in the two
secret stores below. Since it was shared in chat, consider rotating it with
BotFather `/revoke` after setup.

---

## 1. Report → Telegram (required for weekly reports)

Add two repo secrets — **Settings → Secrets and variables → Actions → New
repository secret**:

- `TELEGRAM_BOT_TOKEN` = the BotFather token
- `TELEGRAM_CHAT_ID` = `5597392397`

That's it — the next run (scheduled or manual) messages you the report. If these
are absent the workflow just skips the notify step.

## 2. Telegram → GitHub (`/verify` control)

### a. GitHub fine-grained PAT

**Settings → Developer settings → Fine-grained tokens → Generate new token**
- Resource owner: `trilumos`, Repository access: **Only** `calcyourfinance`
- Repository permissions → **Actions: Read and write** (nothing else)
- Copy the token (starts `github_pat_…`).

### b. Deploy the Worker + set its secrets

```bash
cd telegram
npx wrangler deploy                     # prints the Worker URL

npx wrangler secret put BOT_TOKEN       # paste the BotFather token
npx wrangler secret put CHAT_ID         # 5597392397
npx wrangler secret put GH_PAT          # the github_pat_… from step a
npx wrangler secret put WEBHOOK_SECRET  # any random string you invent
```

### c. Point Telegram at the Worker

Register the webhook so Telegram delivers your messages to the Worker. Use the
Worker URL from `wrangler deploy` and the **same** WEBHOOK_SECRET:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  --data-urlencode "url=https://cyf-rate-verify-bot.<your-subdomain>.workers.dev/" \
  --data-urlencode "secret_token=<WEBHOOK_SECRET>"
```

(Ask me to run this once you have the Worker URL — I can reach Telegram from
here.)

### Test

Send `/verify` to the bot → it replies "started", the Action runs, and the
report lands back in the chat. `/help` lists commands.

---

## Security notes

- The Worker only obeys the one `CHAT_ID`; other users are ignored.
- `WEBHOOK_SECRET` stops anyone spoofing Telegram to your Worker URL.
- The PAT is scoped to Actions on this repo only — worst case, someone could
  trigger a workflow run, nothing else.
