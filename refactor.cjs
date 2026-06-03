const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fonts
  content = content.replace(/\bfont-display\b/g, '');
  content = content.replace(/\bfont-mono\b/g, '');
  content = content.replace(/\bfont-sans\b/g, '');
  
  // Backgrounds
  content = content.replace(/\bbg-slate-950(\/[0-9]+)?\b/g, 'bg-slate-50 dark:$&');
  content = content.replace(/\bbg-\[\#030712\]\b/g, 'bg-slate-50 dark:$&');
  content = content.replace(/\bbg-\[\#060a12\]\b/g, 'bg-white dark:$&');
  content = content.replace(/\bbg-slate-900(\/[0-9]+)?\b/g, 'bg-white dark:$&');
  content = content.replace(/\bbg-slate-850(\/[0-9]+)?\b/g, 'bg-slate-100 dark:$&');
  content = content.replace(/\bbg-slate-800(\/[0-9]+)?\b/g, 'bg-slate-100 dark:$&');
  content = content.replace(/\bbg-slate-700(\/[0-9]+)?\b/g, 'bg-slate-200 dark:$&');
  
  // Borders
  content = content.replace(/\bborder-slate-800(\/[0-9]+)?\b/g, 'border-slate-200 dark:$&');
  content = content.replace(/\bborder-slate-850(\/[0-9]+)?\b/g, 'border-slate-200 dark:$&');
  content = content.replace(/\bborder-slate-900(\/[0-9]+)?\b/g, 'border-slate-300 dark:$&');
  content = content.replace(/\bborder-slate-700(\/[0-9]+)?\b/g, 'border-slate-300 dark:$&');
  
  // Text
  content = content.replace(/\btext-slate-400\b/g, 'text-slate-500 dark:$&');
  content = content.replace(/\btext-slate-300\b/g, 'text-slate-700 dark:$&');
  content = content.replace(/\btext-white\b/g, 'text-slate-900 dark:$&');
  content = content.replace(/\btext-slate-100\b/g, 'text-slate-900 dark:$&');
  content = content.replace(/\btext-slate-200\b/g, 'text-slate-800 dark:$&');

  // Fix multiple spaces from font removal
  content = content.replace(/  +/g, ' ');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Refactoring complete.');
