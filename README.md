# Stay Young — social publishing only

Creates original-image posts in American English for women and men and schedules them on supported official APIs. No paid dependencies. No access to the course website, WordPress, WooCommerce, servers or checkout. No email, chatbot or CRM.

Every post includes **exactly** `https://ownyourglowup.com/im-40-years-old-i-look-20-v3/`. The URL is never fetched by this system, shortened or changed; no tracking parameters are added. Only the owner-provided course name and general self-care messaging are used. There are no claims about curriculum, age reversal, price, refunds or results.

## Prepared workflow

Node 24: `npm ci --ignore-scripts`, `npm test`, `npm run plan`, `npm run preflight`.

48 drafts cover Facebook Pages, Pinterest, Threads and Bluesky. Optional Instagram and Mastodon adapters add 24 drafts if enabled. Twelve original commercial-use PNG illustrations cover skincare, food, movement, rest and daily routines. All images are local assets; public image URLs are derived from this repository’s main branch. Hosting is not assumed ready until checked against the exact original image bytes.

Publishing defaults to disabled. Both a code gate and a one-time owner-approval variable are required. The project has been pushed to GitHub main and all 12 hosted images matched the original files. Actual account connections, cloud workflow execution and real provider authorization must still be verified before activation. Mocked API tests are not proof of a connected account.

## Cloud and safety

`.github/workflows/automation.yml` schedules Monday/Wednesday/Friday at 12:15 New York (09:15 Pacific), including daylight-saving changes. GitHub schedules are best effort and can be delayed; public-repository schedules can be disabled by GitHub after prolonged inactivity. Each platform gets at most one post per due run, with a 42-hour cooldown. The finite 12-post series stops and reports exhaustion rather than recycling posts.

Publishing reservations live in a separate `automation-state` Git branch, through the official GitHub Contents API. SHA conflict detection prevents lost concurrent writes. A reservation is saved before a post is sent. An ambiguous error blocks that account for review, even on later runners; no automatic retries or expiring cache can cause a duplicate. If a provider succeeds but state confirmation fails, review the provider before clearing anything.

The workflow uses only standard public-repository Linux runners, with no paid action/service or artifact-storage dependence. Private or unknown repository billing is blocked. Repository visibility is never changed automatically. No promises are made about traffic or sales.

See [operations](docs/OPERATIONS.md), [account access](docs/ACCESS.md), and [artwork rights](docs/ASSET-RIGHTS.md).

Each cloud task is isolated. Use this checkout; do not create a Git worktree unless explicitly requested.
