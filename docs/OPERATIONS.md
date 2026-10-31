# Operator runbook

## Dry run

In `/workspace/stay-young-automation`, run `npm ci --ignore-scripts`, `npm test`, `npm run plan`, `npm run preflight`. Tests use local assets and mocked official APIs only. They never request the course website and never publish. The plan contains an exact fixed destination link, network-specific captions/hashtags/keywords, alt text, image URLs and upcoming US-time slots. `artifacts/content-gallery.html` presents the original artwork and draft copy for review.

## Official connections

The code contains no password-collection page, no fake authorization links and no operational OAuth app. Account owners must authorize official provider applications through their official flows. App registration/review, permissions and eligibility can require owner participation. No browser or account-connection connector is available in this workspace, so these authorizations cannot be completed here until an official secure connection is provided. Do not request token values in chat or use scraping/password automation as a workaround.

Secure runtime bindings are listed in ACCESS.md. Official provider token expiry/revocation can stop scheduled posting; automatic OAuth token refresh is not implemented. Check provider dashboards and refresh through official secure authorization when required. Facebook targets Pages; personal-profile automation is unsupported. Threads and Pinterest require eligible API app access. Bluesky supports its official app-password API in this implementation; official OAuth is preferable for a multiuser product. Mastodon is optional and limited to mastodon.social until another official instance is explicitly configured and validated.

## First launch: one owner approval

Before asking for activation approval, complete every non-publishing check: real account verification calls, permissions, public-image integrity, durable GitHub state, schedule, no-spend runner eligibility and the selected drafts. Obtain explicit owner approval once for the first publication and recurring schedule. Only then set config.enabled=true and owner-controlled FIRST_LAUNCH_APPROVED=yes plus LIVE_AUTOMATION_ENABLED=yes in GitHub. Publishing cannot run from a push event; it runs only on due scheduled/manual publishing events. A manual dry run never publishes. Outside the US posting window, even a manual publish command performs no provider calls.

Do not ask for repeated per-post confirmations after that approval. If a connection is revoked, reauthorization is an owner action, not new permission to change the course website. Never access or modify the course site, even for troubleshooting. The destination link is an opaque constant supplied by the owner.

## Cloud storage and images

GitHub must host a public code/assets repository for the free standard-runner route. Do not change visibility without owner authorization. This code derives original PNG URLs at raw.githubusercontent.com; it verifies MIME type, file size and exact local-image bytes before publication. All twelve hosted PNGs were retrieved from the configured GitHub image URLs and matched byte-for-byte in this environment; independent provider retrieval is still unverified. State branch data contains publication identifiers and fingerprints, never provider credentials. GitHub’s generated runtime token writes durable state; no separate GitHub token is requested from the owner.

## Review and failure handling

GitHub Actions job summaries report statuses and publication counts; failed runs notify according to the owner’s GitHub notification settings. Content exhaustion fails visibly so drafts can be extended without recycling. Check automation-state/publisher-state.json for reserved/needs_review records. Never reset these based solely on a timeout. First verify whether the provider actually published, then reconcile the remote ID. A provider outage, invalid image or missing authorization on one platform does not stop checks for other platforms.

There is no analytics tracking or attribution system. The fixed link is never changed. Instagram remains optional because caption links are generally not clickable; it cannot satisfy a clickable-caption requirement. Its bio link, if used, must be handled by the account owner through a separately authorized account change. No such change is part of this system.

## Validation boundaries

The local suite verifies all default posting paths with mocked provider responses, US scheduling across DST, one-time approval, durable reservation restart/conflict behavior, link integrity, content limits, safety claims and original-image integrity. It does not prove provider app review, remote permissions, OAuth/token validity, cloud execution or actual social publication. Those remain unverified until the required secure account connections are available. No real post has been published.
