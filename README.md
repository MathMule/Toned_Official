# Deploying Toned (with hidden API key)

This package fixes the "Failed to fetch" error and removes the need for
users to enter their own Anthropic API key. Your key lives only on
Vercel's servers.

## What changed
- `index.html` — Toned's frontend now calls `/api/compose` (same origin)
  instead of `api.anthropic.com` directly. The "add key" button and modal
  are gone — there's nothing for users to set up.
- `api/compose.js` — a serverless function that receives requests from the
  frontend, attaches your Anthropic key server-side, and forwards them to
  Anthropic. This is what fixes CORS (browsers can't call Anthropic
  directly) and keeps your key private.
- `vercel.json` / `package.json` — minimal config so Vercel knows how to
  serve the site and run the function.

## Deploy in 5 steps

1. **Push this folder to GitHub**
   Create a new repo, add these files (`index.html`, `api/compose.js`,
   `vercel.json`, `package.json`), commit, and push.

2. **Import into Vercel**
   Go to [vercel.com](https://vercel.com) → sign in with GitHub →
   "Add New Project" → select your repo → Deploy.
   (Leave all build settings as default — there's no build step needed.)

3. **Add your API key as an environment variable**
   In the Vercel dashboard: your project → **Settings** → **Environment
   Variables** → add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
   - Environment: Production (and Preview if you want)

   Click **Save**, then **redeploy** (Vercel won't pick up a new env var
   on an old deployment — trigger a redeploy from the Deployments tab).

4. **Visit your live URL**
   Vercel gives you a `https://your-project.vercel.app` URL automatically.
   Open it — the "compose" buttons should now work with no key prompt.

5. **(Optional) Custom domain**
   Settings → Domains → add your own domain if you have one.

## Cost note

Every time a user clicks "compose," it calls Claude using *your* key, so
**you** pay for it (a piano piece is roughly $0.02–0.05 depending on
length). There is currently no usage limiting — if this gets real
traffic, consider adding rate limiting (e.g. per-IP request caps) inside
`api/compose.js` before launching publicly.

## Local testing (optional)

If you want to test before deploying:
```
npm install -g vercel
vercel dev
```
This runs the same serverless function locally. You'll need a `.env.local`
file with `ANTHROPIC_API_KEY=sk-ant-...` in the project root (don't commit
this file — add it to `.gitignore`).
