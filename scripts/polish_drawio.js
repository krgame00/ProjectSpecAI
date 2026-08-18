const fs = require('fs');
const filePath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('name="2. เข้าสู่ระบบ (User Login &amp; JWT Auth)"', 'name="2. เข้าสู่ระบบ (User Login)"');
content = content.replace('name="2. เข้าสู่ระบบ (User Login & JWT Auth)"', 'name="2. เข้าสู่ระบบ (User Login)"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Diagram 2 name polished successfully.');
