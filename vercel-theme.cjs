const fs = require('fs');
const path = require('path');

const directory = './src/components';

const rules = [
  // Primary buttons (e.g., bg-blue-600 text-white) to White buttons with black text
  { pattern: /bg-blue-600 text-white hover:bg-blue-700/g, replacement: 'bg-[#ededed] text-black hover:bg-white border border-[#ededed]' },
  { pattern: /bg-blue-600 hover:bg-blue-700/g, replacement: 'bg-[#ededed] hover:bg-white text-black border border-[#ededed]' },
  
  // Secondary / Toggle buttons
  { pattern: /bg-blue-500/g, replacement: 'bg-[#ededed]' },
  { pattern: /text-blue-500/g, replacement: 'text-[#ededed]' },
  
  // Base backgrounds to pitch black
  { pattern: /bg-zinc-950/g, replacement: 'bg-black' },
  { pattern: /bg-zinc-900(?!\/)/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#0a0a0c\]/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#161434\]/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#0f0f11\]/g, replacement: 'bg-[#0a0a0a]' },
  { pattern: /bg-\[\#0c0c0e\]/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#121214\]/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#111\]/g, replacement: 'bg-black' },
  { pattern: /bg-\[\#222\]/g, replacement: 'bg-[#0a0a0a]' },

  // Borders to #27272a (zinc-800)
  { pattern: /border-zinc-900(?!\/)/g, replacement: 'border-zinc-800' },
  { pattern: /border-\[\#333\]/g, replacement: 'border-zinc-800' },
  { pattern: /border-\[\#222\]/g, replacement: 'border-zinc-800' },
  
  // Text colors
  { pattern: /text-\[\#ccc\]/g, replacement: 'text-[#888888]' },
  { pattern: /text-zinc-500/g, replacement: 'text-zinc-400' },

  // Hover states
  { pattern: /hover:bg-\[\#222\]/g, replacement: 'hover:bg-[#111111]' },
  { pattern: /hover:bg-zinc-800/g, replacement: 'hover:bg-zinc-900' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of rules) {
        content = content.replace(rule.pattern, rule.replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Applied Vercel theme to ${fullPath}`);
      }
    }
  }
}

const rootFiles = ['./src/App.tsx'];
for (const file of rootFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    for (const rule of rules) {
      content = content.replace(rule.pattern, rule.replacement);
    }
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Applied Vercel theme to ${file}`);
    }
  }
}

processDirectory(directory);
console.log('Vercel theme conversion complete.');
