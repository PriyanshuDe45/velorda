require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User        = require('./models/User');
const Category    = require('./models/Category');
const Bicycle     = require('./models/Bicycle');
const Tariff      = require('./models/Tariff');
const Booking     = require('./models/Booking');
const Application = require('./models/Application');
const PromoCode   = require('./models/PromoCode');

async function exportDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/velorda');

  const outDir = path.join(__dirname, '..', 'database');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const collections = { User, Category, Bicycle, Tariff, Booking, Application, PromoCode };
  let sql = '-- VelOrda MongoDB Export\n\n';

  for (const [name, Model] of Object.entries(collections)) {
    const docs = await Model.find({}).lean();
    sql += `-- Collection: ${name} (${docs.length} documents)\n`;
    fs.writeFileSync(
      path.join(outDir, `${name.toLowerCase()}s.json`),
      JSON.stringify(docs, null, 2)
    );
    console.log(`Exported ${name}: ${docs.length} docs`);
  }

  fs.writeFileSync(path.join(outDir, 'DB-dump.sql'), sql);
  console.log('Done! Files in /database folder');
  await mongoose.disconnect();
}

exportDB().catch(console.error);