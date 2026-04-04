import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
};

const componentsDir = path.join(process.cwd(), 'src', 'components');
const pagesDir = path.join(process.cwd(), 'src', 'pages');
const cssPath = path.join(process.cwd(), 'src', 'index.css');
const appPath = path.join(process.cwd(), 'src', 'App.jsx');

const files = [...walk(componentsDir), ...walk(pagesDir), cssPath, appPath];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Backgrounds
  content = content.replace(/#0B0F1A/gi, '#0A0A0A');
  content = content.replace(/#0F172A/gi, '#0A0A0A');
  content = content.replace(/#020617/gi, '#0A0A0A');
  content = content.replace(/#0f172a/gi, '#0A0A0A');
  
  // Sections / Cards
  content = content.replace(/bg-white\/5/g, 'bg-[#1A1A1A]/80');
  content = content.replace(/bg-\[#1e293b\]\/[0-9]+/g, 'bg-[#1A1A1A]/80');
  content = content.replace(/bg-\[#1e293b\]/g, 'bg-[#1A1A1A]/80');
  content = content.replace(/bg-\[#0B0F1A\]\/[0-9]+/g, 'bg-[#111111]');

  content = content.replace(/bg-gradient-to-r from-teal-500 to-cyan-500/g, 'bg-blue-500 hover:bg-blue-400');
  
  // Teals to Blues
  content = content.replace(/#14B8A6/gi, '#3B82F6');
  content = content.replace(/#0d9488/gi, '#60A5FA');
  content = content.replace(/#119e8d/gi, '#60A5FA');
  content = content.replace(/#06b6d4/gi, '#60A5FA');
  
  // Greens to Blues
  content = content.replace(/#22C55E/gi, '#3B82F6');
  content = content.replace(/green-500/g, 'blue-500');
  content = content.replace(/green-400/g, 'blue-400');
  
  // Text opacities
  content = content.replace(/text-white\/50/g, 'text-white/40');
  content = content.replace(/text-white\/60/g, 'text-white/70');
  content = content.replace(/text-white\/80/g, 'text-white');
  
  // Inputs
  // "Inputs: dark background (#111111), subtle border, blue focus ring"
  content = content.replace(/bg-\[#0f172a\]/g, 'bg-[#111111]');
  content = content.replace(/focus:border-\[#14B8A6\]/g, 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500');
  
  // Shadow glow updates
  content = content.replace(/rgba\(20,184,166/g, 'rgba(59,130,246'); // 3B82F6 in RGB
  content = content.replace(/rgba\(20, 184, 166/g, 'rgba(59, 130, 246');

  // Fix button borders rounded-xl
  content = content.replace(/rounded-lg/g, 'rounded-xl');
  content = content.replace(/rounded-full/g, 'rounded-xl');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Theme updated globally');
