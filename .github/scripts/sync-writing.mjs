import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';
import { slug as slugify } from 'github-slugger';

// --- 1. Parse all blog posts ---
const blogDir = 'src/content/blog';
const files = readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

const posts = files.map(file => {
  const raw = readFileSync(join(blogDir, file), 'utf-8');
  const { data } = matter(raw);
  const rawSlug = data.slug || basename(file).replace(/\.(md|mdx)$/, '');
  const slug = data.slug || slugify(rawSlug);
  return {
    title: data.title || '',
    summary: data.description || '',
    date: data.pubDatetime ? new Date(data.pubDatetime) : new Date(0),
    dateStr: data.pubDatetime
      ? new Date(data.pubDatetime).toISOString().split('T')[0]
      : '',
    link: `https://rachel.fyi/posts/${slug}`,
    draft: data.draft || false,
  };
})
.filter(p => !p.draft && p.title)
.sort((a, b) => b.date - a.date)
.slice(0, 3);

const patterns = ['dots', 'diagonal', 'grid'];

const postsArrayCode = `const posts = [
${posts.map((p, i) => `    {
        id: ${i + 1},
        date: '${p.dateStr}',
        category: 'Writing',
        title: ${JSON.stringify(p.title)},
        summary: ${JSON.stringify(p.summary)},
        link: ${JSON.stringify(p.link)},
        pattern: '${patterns[i % 3]}'
    }`).join(',\n')}
];`;

// --- 2. Fetch current Writing.tsx from bear.ink ---
const owner = 'rachelslurs';
const repo = 'bear-ink'; 
const filePath = 'src/sections/Writing.tsx';
const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

const headers = {
  Authorization: `Bearer ${process.env.BEAR_INK_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const res = await fetch(apiBase, { headers });
if (!res.ok) throw new Error(`Failed to fetch Writing.tsx: ${res.status} ${await res.text()}`);
const fileData = await res.json();

const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

// --- 3. Replace just the posts array ---
const updated = currentContent.replace(
  /const posts = \[[\s\S]*?\];/,
  postsArrayCode
);

if (updated === currentContent) {
  console.log('No changes detected, skipping commit.');
  process.exit(0);
}

// --- 4. Commit back to bear.ink main ---
const commitRes = await fetch(apiBase, {
  method: 'PUT',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'chore: sync recent posts from rachel.fyi',
    content: Buffer.from(updated).toString('base64'),
    sha: fileData.sha,
    branch: 'main',
  }),
});

if (!commitRes.ok) throw new Error(`Failed to commit: ${commitRes.status} ${await commitRes.text()}`);
console.log('Successfully updated Writing.tsx in bear.ink.');