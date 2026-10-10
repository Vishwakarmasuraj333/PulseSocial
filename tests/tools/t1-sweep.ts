import fs from "fs";
import path from "path";

const SEARCH_DIRS = ["src"];
const IGNORE_DIRS = ["node_modules", ".next", ".git", "dist", "fixtures"];

const PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "fake_or_demo_keywords", regex: /\b(mock|demo|fake|dummy|lorem|faker|placeholder)\b/i },
  { name: "math_random", regex: /Math\.random\s*\(/ },
  { name: "realtime_or_se_ranking", regex: /(REALTIME|SE Ranking Visualizer)/ },
  { name: "fake_provider_ids", regex: /(demo-account|test-account-1|provider_id_[0-9])/ },
  { name: "hardcoded_10_badge", regex: /(badge|unread|count).*[^a-zA-Z0-9]10[^0-9]/i },
];

interface Hit {
  pattern: string;
  file: string;
  line: number;
  content: string;
}

function scanFile(filePath: string, hits: Hit[]) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((lineText, idx) => {
    for (const pat of PATTERNS) {
      if (pat.regex.test(lineText)) {
        hits.push({
          pattern: pat.name,
          file: filePath.replace(/\\/g, "/"),
          line: idx + 1,
          content: lineText.trim(),
        });
      }
    }
  });
}

function walkDir(dir: string, hits: Hit[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, hits);
    } else if (entry.isFile() && /\.(tsx?|jsx?|json)$/.test(entry.name)) {
      scanFile(fullPath, hits);
    }
  }
}

const hits: Hit[] = [];
for (const dir of SEARCH_DIRS) {
  if (fs.existsSync(dir)) {
    walkDir(dir, hits);
  }
}

console.log(`=== T1 FAKE DATA SWEEP RESULTS ===`);
console.log(`Total scanned hits: ${hits.length}`);
console.log(JSON.stringify(hits, null, 2));
