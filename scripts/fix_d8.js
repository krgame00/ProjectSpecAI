const fs = require('fs');
const filePath = 'C:/Users/PC/Downloads/pcspec_all_11_flowcharts (1).drawio';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('ดึงรายการบทความทั้งหมดจากฐานข้อมูล/:id', 'ดึงเนื้อหาบทความฉบับเต็มจากฐานข้อมูล');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Diagram 8 detail node');
