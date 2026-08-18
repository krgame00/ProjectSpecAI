const fs = require('fs');

const xml = fs.readFileSync('scripts/doc2_raw.txt', 'utf8');
const regex = /CITATION\s+([^\\]+?)\s*\\l/g;
let match;
const set = new Set();
while ((match = regex.exec(xml)) !== null) {
  set.add(match[1].trim());
}

console.log('All Citation Keys in Doc 2:');
set.forEach(k => console.log('-', k));

// Also extract all text around CITATION tags
const text = fs.readFileSync('scripts/doc2_clean_text.txt', 'utf8');
const citTexts = text.match(/CITATION\s+[^)]+\)/g) || [];
console.log('\nCitation In-text occurrences:');
citTexts.forEach(c => console.log(c));
