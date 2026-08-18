const fs = require('fs');

const fPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const content = fs.readFileSync(fPath, 'utf8');

// Find all edges with value attribute
const edgeRegex = /<mxCell[^>]*edge="1"[^>]*value="([^"]+)"[^>]*>/g;
let m;
console.log('All non-empty edge values:');
while ((m = edgeRegex.exec(content)) !== null) {
  console.log(m[1]);
}

// Also check reverse attribute order: value="..." ... edge="1"
const edgeRegex2 = /<mxCell[^>]*value="([^"]+)"[^>]*edge="1"[^>]*>/g;
while ((m = edgeRegex2.exec(content)) !== null) {
  console.log(m[1]);
}
