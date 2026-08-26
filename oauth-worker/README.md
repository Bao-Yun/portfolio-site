# GitHub OAuth Proxy (Cloudflare Worker)

`index.js` is copied unmodified (MIT license, see `LICENSE.txt`) from
[sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth). It implements the same
`postMessage` handshake Decap CMS expects, so it works as a drop-in OAuth proxy for the GitHub
backend even though the upstream project targets Sveltia CMS.

This folder is kept here for reference only — the Worker itself is deployed by pasting
`index.js` into the Cloudflare dashboard's Quick Edit editor (no Wrangler/Node required). See the
main project README for the full setup steps.

## Required environment variables (set in the Cloudflare Worker's settings)

- `GITHUB_CLIENT_ID` — from your GitHub OAuth App
- `GITHUB_CLIENT_SECRET` — from your GitHub OAuth App (mark as **secret**, not plaintext)
- `ALLOWED_DOMAINS` (optional but recommended) — e.g. `bao-yun.github.io`, restricts which sites
  may complete the login handshake against this Worker
