const fs = require('fs');

const masterFile = 'C:/Users/PC/Downloads/pcspec_all_system_diagrams_master (1).drawio';
const content = fs.readFileSync(masterFile, 'utf8');

const regex = /<diagram id="([^"]+)" name="([^"]+)">/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  count++;
  console.log(`${count}. [${match[1]}] -> ${match[2]}`);
}
