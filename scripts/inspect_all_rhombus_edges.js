const fs = require('fs');

const fPath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const content = fs.readFileSync(fPath, 'utf8');

// Parse diagram pages
const diagramRegex = /<diagram[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/diagram>/g;
let dMatch;

while ((dMatch = diagramRegex.exec(content)) !== null) {
  const pageName = dMatch[1];
  const pageXml = dMatch[2];
  console.log(`\n=== Page: ${pageName} ===`);
  
  // Find all rhombus shapes
  const rhombusRegex = /<mxCell[^>]*id="([^"]+)"[^>]*style="[^"]*rhombus[^"]*"[^>]*value="([^"]+)"/g;
  let rMatch;
  while ((rMatch = rhombusRegex.exec(pageXml)) !== null) {
    const rId = rMatch[1];
    const rVal = rMatch[2].replace(/<[^>]+>/g, ' ');
    console.log(`  [Rhombus ${rId}]: ${rVal}`);
    
    // Find outgoing edges from this rhombus
    const outEdgeRegex = new RegExp(`<mxCell[^>]*source="${rId}"[^>]*value="([^"]*)"`, 'g');
    let eMatch;
    while ((eMatch = outEdgeRegex.exec(pageXml)) !== null) {
      console.log(`    -> Edge value: "${eMatch[1]}"`);
    }
  }
}
