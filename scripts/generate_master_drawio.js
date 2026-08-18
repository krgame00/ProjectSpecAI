const fs = require('fs');

const usecaseFile = 'C:/Users/PC/Downloads/pcspec_usecase_diagram.drawio';
const activityFile = 'C:/Users/PC/Downloads/pcspec_activity_diagram.drawio';
const erFile = 'C:/Users/PC/Downloads/smart_pc_builder_er_diagram.drawio';
const flowchartFile = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
const masterFile = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master.drawio';

function extractDiagramTag(content) {
  const match = content.match(/<diagram[\s\S]*?<\/diagram>/g);
  return match || [];
}

const usecaseDiag = extractDiagramTag(fs.readFileSync(usecaseFile, 'utf8'));
const activityDiag = extractDiagramTag(fs.readFileSync(activityFile, 'utf8'));
const erDiag = extractDiagramTag(fs.readFileSync(erFile, 'utf8'));
const flowchartDiag = extractDiagramTag(fs.readFileSync(flowchartFile, 'utf8'));

const allDiagrams = [
  ...usecaseDiag,
  ...activityDiag,
  ...erDiag,
  ...flowchartDiag
];

const masterXml = `<mxfile host="Electron" modified="${new Date().toISOString()}" agent="PCSpec Master Generator" version="21.0.0" type="device">
${allDiagrams.join('\n')}
</mxfile>`;

fs.writeFileSync(masterFile, masterXml, 'utf8');
console.log('Created All-in-One Master Draw.io file at:', masterFile, `(Contains ${allDiagrams.length} Diagram Pages)`);
