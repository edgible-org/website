// Builds www.edgible.ai into dist/: the page in site/ as it is, and each playbook in playbooks/
// (one Markdown file per chapter) as a page in the site's look, with its Markdown source beside it
// for AI assistants. Run with: npm run build
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(root, 'build', 'playbook.html'), 'utf8');

rmSync(dist, { recursive: true, force: true });
cpSync(join(root, 'site'), dist, { recursive: true });

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A chapter starts with a few "key: value" lines between --- lines: title, and an optional
// description for search engines and link previews.
function parse(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: starts without its --- title: --- block`);
  const meta = Object.fromEntries(m[1].split('\n').map((l) => l.split(/:\s*(.*)/s).slice(0, 2)));
  if (!meta.title) throw new Error(`${file}: has no title`);
  return { meta, body: text.slice(m[0].length) };
}

const dir = join(root, 'playbooks');
const pages = readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
// First every page's settings, so each can link to the pages before and after it by their titles.
const all = Object.fromEntries(pages.map((file) => [file.replace(/\.md$/, ''), parse(readFileSync(join(dir, file), 'utf8'), file).meta]));
// prev: and next: name another page by its file name, without .md.
function nav(meta, file) {
  const link = (slug, dir) => {
    if (!slug) return '';
    if (!all[slug]) throw new Error(`${file}: ${dir} names ${slug}, which is not a page`);
    return `<a class="${dir}" href="../${slug}/"><span>${dir === 'prev' ? '← Previous' : 'Next →'}</span>${escape(all[slug].title)}</a>`;
  };
  const html = link(meta.prev, 'prev') + link(meta.next, 'next');
  return html ? `<nav class="chapters">${html}</nav>` : '';
}
// icon: names a symbol in site/images/icons.svg, drawn on a navy tile beside the title.
function pageIcon(meta, slug) {
  if (!meta.icon) return '';
  return `<span class="page-ico" aria-hidden="true"><svg><use href="${slug ? '../../' : '../'}images/icons.svg#${escape(meta.icon)}"/></svg></span>`;
}
// The icon goes inside the page's first heading, so the two sit on one line.
function withIcon(html, icon) {
  return icon ? html.replace(/<h1([^>]*)>/, (_, attrs) => `<h1${attrs} class="with-ico">${icon}<span>`).replace('</h1>', '</span></h1>') : html;
}

for (const file of pages) {
  const source = readFileSync(join(dir, file), 'utf8');
  const { meta, body } = parse(source, file);
  const slug = file === 'index.md' ? '' : file.replace(/\.md$/, '');
  const out = join(dist, 'playbooks', slug);
  mkdirSync(out, { recursive: true });
  const html = template
    .replaceAll('{{title}}', escape(meta.title))
    .replaceAll('{{description}}', escape(meta.description || ''))
    .replaceAll('{{root}}', slug ? '../../' : '../')
    .replaceAll('{{source}}', slug ? `../${file}` : 'index.md')
    .replace('{{content}}', withIcon(marked.parse(body), pageIcon(meta, slug)) + (slug ? nav(meta, file) : ''));
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(dist, 'playbooks', file), source);
}
console.log(`built dist/: the site and ${pages.length} playbook page(s)`);
