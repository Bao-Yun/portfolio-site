import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const WORKS_DIR = path.join(process.cwd(), "data", "works");
const OUTPUT_FILE = path.join(process.cwd(), "data", "works-index.json");

const files = (await readdir(WORKS_DIR)).filter((f) => f.endsWith(".md"));

const works = await Promise.all(
  files.map(async (file) => {
    const raw = await readFile(path.join(WORKS_DIR, file), "utf8");
    const { data } = matter(raw);
    return { slug: file.replace(/\.md$/, ""), ...data };
  })
);

works.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

await writeFile(OUTPUT_FILE, JSON.stringify(works, null, 2) + "\n");
console.log(`Wrote ${works.length} works to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
