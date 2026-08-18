const fs = require('fs');

const fPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const content = fs.readFileSync(fPath, 'utf8');

// Find all occurrences of ไม่ถูกต้อง or ถูกต้อง or ใช่ or ไม่ใช่
const matches = Array.from(content.matchAll(/<mxCell[^>]*value="([^"]*(?:ถูกต้อง|ไม่ถูกต้อง|เข้ากันได้|ไม่เข้ากัน|ใช่|ไม่ใช่)[^"]*)"[^>]*>/g));
console.log(`Found ${matches.length} matching cells:`);
matches.forEach(m => console.log(m[0]));
