const fs = require('fs');

const fPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const content = fs.readFileSync(fPath, 'utf8');

// Find all value="..." in mxCell edges
const edgeValues = Array.from(content.matchAll(/<mxCell[^>]*value="([^"]*)"[^>]*edge="1"[^>]*>/g)).map(m => m[1]);
console.log('All edge label values in 11 flowcharts:');
edgeValues.forEach(v => {
  if (v) console.log('-', v);
});
