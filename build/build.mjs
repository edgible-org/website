// Builds www.edgible.ai into dist/: the pages in site/ as they are, and a redirect at each address
// the playbooks had here. The AI Playbooks moved to the cards site (cards.edgible.org/playbooks),
// where they are written and built now, so every old link and bookmark still lands on its page.
// Run with: npm run build
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const moved = 'https://cards.edgible.org/playbooks/';
// The pages the playbooks had here, by file name: index is /playbooks/ itself.
const pages = [
  'index', 'a-home-for-your-apps', 'a-private-model-for-your-agent', 'back-up-an-app', 'choosing-between-them',
  'connect-claude', 'edgible-for-ai', 'edgible-for-operations', 'get-edgible-running', 'getting-a-machine',
  'give-your-agent-your-files', 'looking-after-it', 'move-an-app', 'private-for-your-agent',
  'private-in-your-gateway', 'restore-and-prove-it', 'run-it-from-your-phone', 'second-machine',
  'take-it-all-down', 'under-the-hood', 'use-your-own-domain', 'your-agent', 'your-ai-gateway',
  'your-own-ai-agent', 'your-private-model',
];

rmSync(dist, { recursive: true, force: true });
cpSync(join(root, 'site'), dist, { recursive: true });

const page = (to) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Playbooks · Edgible</title>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${to}">
  <meta http-equiv="refresh" content="0; url=${to}">
  <style>body{font:18px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#111827}a{color:#2e4a9e}@media (prefers-color-scheme:dark){body{background:#0d1020;color:#e8eaf4}a{color:#9db4ff}}</style>
</head>
<body>
  <p>The AI Playbooks have moved to the cards site: <a href="${to}">${to.replace('https://', '')}</a>.</p>
</body>
</html>
`;

for (const name of pages) {
  const to = moved + (name === 'index' ? '' : `${name}/`);
  const out = join(dist, 'playbooks', name === 'index' ? '' : name);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), page(to));
  // The Markdown an AI assistant may have been given: a line saying where it is now.
  writeFileSync(join(dist, 'playbooks', `${name}.md`), `This page moved to ${moved}${name}.md\n`);
}
console.log(`built dist/: the site, and redirects for ${pages.length} playbook page(s) to ${moved}`);
