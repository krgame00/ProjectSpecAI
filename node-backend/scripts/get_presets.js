const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'smart_pc_builder'
  });

  const [cpus] = await db.query("SELECT p.id, p.model, c.socket as cpu_socket FROM products p JOIN spec_cpu c ON p.id=c.product_id WHERE p.category_id=1");
  const [mobos] = await db.query("SELECT p.id, p.model, m.socket as mobo_socket, m.ram_type as mobo_ram_type FROM products p JOIN spec_motherboard m ON p.id=m.product_id WHERE p.category_id=2");
  const [rams] = await db.query("SELECT p.id, p.model, r.ram_type FROM products p JOIN spec_ram r ON p.id=r.product_id WHERE p.category_id=3");
  const [gpus] = await db.query("SELECT id, model FROM products WHERE category_id=4");
  const [storages] = await db.query("SELECT id, model FROM products WHERE category_id=5");
  const [psus] = await db.query("SELECT id, model FROM products WHERE category_id=6");
  const [cases] = await db.query("SELECT id, model FROM products WHERE category_id=7");

  function findCompatibleSet(targetCpuName, targetGpuName) {
    const cpu = cpus.find(c => c.model.includes(targetCpuName));
    const mobo = mobos.find(m => m.mobo_socket === cpu.cpu_socket);
    const ram = rams.find(r => r.ram_type === mobo.mobo_ram_type);
    const gpu = gpus.find(g => g.model.includes(targetGpuName)) || gpus[0];
    
    return `{ cpu: ${cpu.id}, mobo: ${mobo.id}, ram: ${ram.id}, gpu: ${gpu.id}, storage: ${storages[0].id}, psu: ${psus[0].id}, case: ${cases[0].id} }`;
  }

  console.log("budget:", findCompatibleSet("12100F", "RTX 3060"));
  console.log("emu:", findCompatibleSet("13400F", "RTX 4060"));
  console.log("anim:", findCompatibleSet("14700K", "RTX 4070"));

  await db.end();
}

run();
