# Today's candle pack

English briefing for the Community Manager bot. A GitHub Action runs `tools/daily-pack.mjs` at 00:10 UTC and publishes `YYYY-MM-DD.json`, `.md`, `.svg`, and `latest.*` to the `daily-pack` branch. Nothing in this workflow posts to Nostr, X, or anywhere else.

Stable URL after the Action has run: `https://github.com/ondanueve/choppy-bitcoin/raw/daily-pack/latest.json`. If this folder is later merged and assembled onto GitHub Pages, the same files can also be served at `https://bitcoinizate.com/choppy-bitcoin/daily-pack/latest.json`.

The sample files in this pull request are generated from the live daily seed so reviewers can see the format. They are not a post.
