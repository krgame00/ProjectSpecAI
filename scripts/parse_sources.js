const fs = require('fs');

const xml = fs.readFileSync('scripts/customXml_item2.xml.xml', 'utf8');

// Parse each <b:Source> tag
const sources = xml.match(/<b:Source>[\s\S]*?<\/b:Source>/g) || [];

console.log(`Total Sources in Document: ${sources.length}\n`);

sources.forEach((src, idx) => {
  const getTag = (t) => {
    const m = src.match(new RegExp(`<b:${t}>([\\s\\S]*?)<\\/b:${t}>`));
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
  };

  const tag = getTag('Tag');
  const type = getTag('SourceType');
  const title = getTag('Title');
  const year = getTag('Year');
  const journal = getTag('JournalName');
  const publisher = getTag('Publisher');
  const city = getTag('City');
  const authors = Array.from(src.matchAll(/<b:Person><b:Last>([\s\S]*?)<\/b:Last><\/b:Person>/g)).map(m => m[1].trim());
  const corp = getTag('Corporate');
  const authorStr = corp || authors.join(', ');

  console.log(`[${idx + 1}] Tag: ${tag} (${type})`);
  console.log(`    ผู้แต่ง: ${authorStr}`);
  console.log(`    ชื่อเรื่อง: ${title}`);
  console.log(`    ปี: ${year}`);
  if (journal) console.log(`    วารสาร: ${journal}`);
  if (publisher) console.log(`    สำนักพิมพ์/แหล่งที่มา: ${publisher}`);
  console.log('');
});
