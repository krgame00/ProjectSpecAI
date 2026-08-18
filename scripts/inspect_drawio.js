const fs = require('fs');
const content = fs.readFileSync('C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio', 'utf8');
const diagrams = content.split('<diagram');
diagrams.slice(1).forEach((d, idx) => {
  const nameMatch = d.match(/name="([^"]+)"/);
  console.log(`\n=== Diagram ${idx + 1}: ${nameMatch ? nameMatch[1] : ''} ===`);
  const values = [...d.matchAll(/value="([^"]*)"/g)].map(m => m[1]);
  values.forEach(v => {
    if (v) console.log('  - ' + v);
  });
});
