const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-\[oklch\(0\.13_0\.038_248\/?[\d\.]*\)\]/g, replacement: 'bg-background' },
  { regex: /bg-\[oklch\(0\.11_0\.034_248\/?[\d\.]*\)\]/g, replacement: 'bg-background' },
  { regex: /bg-\[oklch\(0\.10_0\.032_248\/?[\d\.]*\)\]/g, replacement: 'bg-sidebar' },
  { regex: /bg-\[oklch\(0\.15_0\.040_248\/?[\d\.]*\)\]/g, replacement: 'bg-card' },
  { regex: /bg-\[oklch\(0\.17_0\.042_248\/?[\d\.]*\)\]/g, replacement: 'bg-secondary' },
  { regex: /bg-\[oklch\(0\.16_0\.040_248\/?[\d\.]*\)\]/g, replacement: 'bg-secondary' },
  { regex: /bg-\[oklch\(0\.18_0\.042_248\/?[\d\.]*\)\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[oklch\(0\.20_0\.044_248\/?[\d\.]*\)\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[oklch\(0\.20_0\.046_248\/?[\d\.]*\)\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[oklch\(0\.19_0\.044_248\/?[\d\.]*\)\]/g, replacement: 'bg-input' },

  // Borders
  { regex: /border-\[oklch\(0\.20_0\.042_248\/?[\d\.]*\)\]/g, replacement: 'border-border' },
  { regex: /border-\[oklch\(0\.22_0\.044_248\/?[\d\.]*\)\]/g, replacement: 'border-border' },
  { regex: /border-\[oklch\(0\.24_0\.046_248\/?[\d\.]*\)\]/g, replacement: 'border-border' },
  { regex: /border-\[oklch\(0\.26_0\.048_248\/?[\d\.]*\)\]/g, replacement: 'border-border' },
  { regex: /border-\[oklch\(0\.28_0\.044_248\/?[\d\.]*\)\]/g, replacement: 'border-input' },
  { regex: /border-\[oklch\(0\.30_0\.044_248\/?[\d\.]*\)\]/g, replacement: 'border-input' },

  // Texts - Navy
  { regex: /text-\[oklch\(0\.14_0\.042_248\/?[\d\.]*\)\]/g, replacement: 'text-primary-foreground' },

  // Texts - Light/Cream
  { regex: /text-\[oklch\(0\.94_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'text-foreground' },
  { regex: /text-\[oklch\(0\.92_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'text-foreground' },
  { regex: /text-\[oklch\(0\.90_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'text-foreground' },
  { regex: /text-\[oklch\(0\.88_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'text-card-foreground' },
  
  // Texts - Muted (Navy lightened)
  { regex: /text-\[oklch\(0\.62_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.55_0\.025_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.52_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.50_0\.025_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.48_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.45_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.42_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.40_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.38_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.35_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.32_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[oklch\(0\.30_0\.028_248\/?[\d\.]*\)\]/g, replacement: 'text-muted-foreground' },

  // Primary Buttons Backgrounds (Cream -> bg-primary, text -> text-primary-foreground)
  { regex: /bg-\[oklch\(0\.94_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[oklch\(0\.92_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[oklch\(0\.90_0\.010_82\/?[\d\.]*\)\]/g, replacement: 'bg-primary' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      // Also fix hovering where it changes to slightly different oklch values
      content = content.replace(/hover:bg-\[oklch\([\d\.\s_]+\/?[\d\.]*\)\]/g, 'hover:bg-accent hover:text-accent-foreground');
      content = content.replace(/hover:text-\[oklch\([\d\.\s_]+\/?[\d\.]*\)\]/g, 'hover:text-foreground');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'frontend/src'));
console.log('Done.');
