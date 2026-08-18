const fs = require('fs');
const path = 'C:/Users/PC/Downloads/บทที่ 2 V2.docx';

// Let's read docx as binary buffer and extract XMLs using Node Buffer / zlib
const buffer = fs.readFileSync(path);
console.log('Docx file size:', buffer.length);

// Let's find any text matching http or journal titles in the buffer
const raw = buffer.toString('utf8');
const urls = raw.match(/https?:\/\/[^\s<>"'\\]+/g) || [];
console.log('Found URLs in docx:');
Array.from(new Set(urls)).forEach(u => console.log('-', u));
