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

  // 1. Remove framer-motion imports
  content = content.replace(/import\s+.*?motion.*?from\s+['"]framer-motion['"];?\s*/g, '');

  // 2. Replace motion tags with standard tags
  const tags = ['div', 'span', 'h1', 'h2', 'h3', 'h4', 'p', 'button', 'ul', 'li', 'svg', 'path', 'a'];
  tags.forEach(tag => {
    const openRegex = new RegExp(`<motion\\.${tag}\\b`, 'g');
    const closeRegex = new RegExp(`</motion\\.${tag}>`, 'g');
    content = content.replace(openRegex, `<${tag}`);
    content = content.replace(closeRegex, `</${tag}>`);
  });

  // 3. Replace AnimatePresence
  content = content.replace(/<AnimatePresence\b[^>]*>/g, '<>');
  content = content.replace(/<\/AnimatePresence>/g, '</>');

  // 4. Remove framer-motion props
  // We match props like initial={...} or animate="..."
  // This regex matches a word boundary, the prop name, an equals sign, and then either a JSX expression {...} or a string "..." or '...'
  const motionProps = ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileDrag', 'layoutId', 'layout'];
  motionProps.forEach(prop => {
    // Matches prop={...} handling nested braces up to 1 level (sufficient for most inline objects)
    const regex1 = new RegExp(`\\s+${prop}=\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}`, 'g');
    content = content.replace(regex1, '');
    // Matches prop="..."
    const regex2 = new RegExp(`\\s+${prop}=["'][^"']*["']`, 'g');
    content = content.replace(regex2, '');
    // Matches prop (boolean, e.g., layout)
    const regex3 = new RegExp(`\\s+${prop}\\b(?!=)`, 'g');
    content = content.replace(regex3, '');
  });

  // 5. Remove animation classes from tailwind
  content = content.replace(/\btransition-\S+\b/g, '');
  content = content.replace(/\bduration-\d+\b/g, '');
  content = content.replace(/\bease-\S+\b/g, '');
  content = content.replace(/\bdelay-\d+\b/g, '');
  content = content.replace(/\bhover:scale-\d+\b/g, '');
  content = content.replace(/\bactive:scale-\d+\b/g, '');
  content = content.replace(/\banimate-pulse\b/g, '');
  
  // 6. Color transformation to pure monochrome
  // Replace ALL colorful/slate palettes with `neutral`
  const colorFamilies = [
    'slate', 'gray', 'zinc', 'stone', 'red', 'orange', 'amber', 'yellow',
    'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
    'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ];
  
  colorFamilies.forEach(color => {
    const regex = new RegExp(`\\b${color}-(\\d{2,3})\\b`, 'g');
    content = content.replace(regex, 'neutral-$1');
  });

  // 7. Force pure black and white extremes
  // bg-neutral-900, 950 -> bg-black
  content = content.replace(/\bbg-neutral-9[05]0\b/g, 'bg-black');
  // bg-neutral-50, 100 -> bg-white
  content = content.replace(/\bbg-neutral-[51]0\b/g, 'bg-white');
  
  // text-neutral-900, 950 -> text-black
  content = content.replace(/\btext-neutral-9[05]0\b/g, 'text-black');
  // text-neutral-50, 100 -> text-white
  content = content.replace(/\btext-neutral-[51]0\b/g, 'text-white');

  // border-neutral-900, 950 -> border-black
  content = content.replace(/\bborder-neutral-9[05]0\b/g, 'border-black');
  // border-neutral-50, 100 -> border-white
  content = content.replace(/\bborder-neutral-[51]0\b/g, 'border-white');

  // 8. Clean up multiple spaces inside className strings due to removals
  content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
    const cleanedClasses = classes.replace(/\s+/g, ' ').trim();
    return `className=${quote}${cleanedClasses}${quote}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
});
console.log('Done!');
