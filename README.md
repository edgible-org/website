# www.edgible.ai

Edgible's website: the main page and the playbooks.

- **`site/`:** the main page, `index.html`, published as it is. The copy comes from Edgible's Vision 2028 messaging. Images are in `site/images/`: the Edgible logo, symbol and favicon, and the icon set as one sprite, `icons.svg`. `site/llms.txt` is the plain-facts summary for AI assistants.
- **`playbooks/`:** one Markdown file per chapter, built into pages at /playbooks in the site's look, with each Markdown source published beside its page. How to write one: [playbooks/README.md](playbooks/README.md).
- **`worker/`:** the contact form's back end, a Cloudflare Worker deployed by hand (`npx wrangler deploy`, with the secret `TURNSTILE_SECRET` set by `npx wrangler secret put`). It checks Turnstile and emails the message to contact@edgible.com through Cloudflare Email Sending. The form is `site/contact/`.
- **`build/`:** the build (`build.mjs`) and the playbook page template (`playbook.html`).

Preview it locally:

```bash
npm install
npm run preview   # builds dist/, then open http://127.0.0.1:8787
```

**Publishing:** every merge to `main` runs the `publish` workflow, which builds the site and pushes the result to the `live` branch. The [static-site card](https://github.com/edgible-org/cards/tree/main/static-site) on an Edgible device serves www.edgible.ai from the `live` branch's archive, downloaded every few minutes, so a merge goes live within minutes. Pull requests are built too, so a broken playbook fails its check before it is merged.

The typeface is Nexa, Edgible's own, served from `site/fonts/` as www.edgible.com does. It is a licensed font, used here under Edgible's licence.
