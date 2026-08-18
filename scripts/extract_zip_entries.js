const fs = require('fs');
const zlib = require('zlib');

function readZipEntries(buffer) {
  let offset = 0;
  const entries = {};
  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) === 0x04034b50) { // Local file header
      const nameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const compMethod = buffer.readUInt16LE(offset + 8);
      const compSize = buffer.readUInt32LE(offset + 18);
      const uncompSize = buffer.readUInt32LE(offset + 22);
      const name = buffer.toString('utf8', offset + 30, offset + 30 + nameLen);
      const dataOffset = offset + 30 + nameLen + extraLen;
      const compData = buffer.slice(dataOffset, dataOffset + compSize);
      
      if (compMethod === 8) { // Deflated
        try {
          entries[name] = zlib.inflateRawSync(compData).toString('utf8');
        } catch(e) {}
      } else if (compMethod === 0) { // Stored
        entries[name] = compData.toString('utf8');
      }
      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }
  return entries;
}

const buffer = fs.readFileSync('C:/Users/PC/Downloads/บทที่ 2 V2.docx');
const entries = readZipEntries(buffer);
console.log('Zip Entries extracted:', Object.keys(entries));

for (const name of Object.keys(entries)) {
  if (name.includes('customXml') || name.includes('sources') || name.includes('bib')) {
    console.log(`\n=== Entry: ${name} ===`);
    console.log(entries[name].slice(0, 2000));
    fs.writeFileSync(`scripts/${name.replace(/[\/\\]/g, '_')}.xml`, entries[name], 'utf8');
  }
}
