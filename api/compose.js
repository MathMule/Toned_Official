// /api/compose.js
//
// This serverless function runs on Vercel's servers — NOT in the user's browser.
// It receives a request from Toned's frontend, attaches YOUR Anthropic API key
// (stored securely as an environment variable, never exposed to users), and
// forwards the request to Anthropic. This solves two problems at once:
//
//   1. CORS — browsers can't call api.anthropic.com directly; server-to-server
//      requests have no such restriction.
//   2. Key security — your API key lives only on Vercel's servers, never in
//      any file a user's browser can see.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Pull your key from Vercel's environment variables (set in the dashboard,
  // never committed to code, never sent to the browser).
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY. Set it in Vercel → Project → Settings → Environment Variables.'
    });
  }

  const { system, messages, max_tokens, model } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Request body must include a "messages" array.' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1500,
        system: system || undefined,
        messages: messages
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      // Forward Anthropic's actual error message so the frontend can show it
      return res.status(anthropicRes.status).json({
        error: data.error?.message || `Anthropic API returned status ${anthropicRes.status}`
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Anthropic: ' + err.message });
  }
}
