const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Fix motion.circle
  content = content.replace(/<motion\.circle\b/g, '<circle');
  content = content.replace(/<\/motion\.circle>/g, '</circle>');

  // Fix corrupted classes from "transition-X" and "animate-X" being truncated
  // Examples:
  // "rounded-full-spin" -> "rounded-full animate-spin"
  // "bg-neutral-500-pulse" -> "bg-neutral-500 animate-pulse"
  // "text-neutral-400-all" -> "text-neutral-400"
  // "dark:bg-black/40-colors" -> "dark:bg-black/40"
  // "rounded-lg-all" -> "rounded-lg"
  // "tracking-wider-all" -> "tracking-wider"

  // 1. Fix -spin
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-spin\b/g, '$1 animate-spin');
  // 2. Fix -pulse
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-pulse\b/g, '$1'); // Just remove pulse, user wants no animations
  // 3. Fix -all
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-all\b/g, '$1');
  // 4. Fix -colors
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-colors\b/g, '$1');
  // 5. Fix -opacity
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-opacity\b/g, '$1');
  // 6. Fix -transform
  content = content.replace(/([a-zA-Z0-9_\[\]\/]+)-transform\b/g, '$1');

  // Fix standalone occurrences if any (like "-all" preceded by space)
  content = content.replace(/\s-all\b/g, ' ');
  content = content.replace(/\s-colors\b/g, ' ');
  content = content.replace(/\s-pulse\b/g, ' ');
  content = content.replace(/\s-spin\b/g, ' animate-spin ');
  content = content.replace(/\s-opacity\b/g, ' ');
  content = content.replace(/\s-transform\b/g, ' ');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
console.log('Fix completed!');
