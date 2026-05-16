require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');
const { parse } = require('csv-parse/sync');

const User        = require('./models/User');
const Category    = require('./models/Category');
const Bicycle     = require('./models/Bicycle');
const Tariff      = require('./models/Tariff');
const Booking     = require('./models/Booking');
const Application = require('./models/Application');

const DATA_DIR   = path.join(__dirname, '..', 'media-files', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'media-files', 'images');
const UPLOADS    = path.join(__dirname, 'uploads');

const REAL_PASSWORDS = {
  USR_01: 'ts2025u1',
  USR_02: 'ts2025u2',
  USR_03: 'ts2025u3',
  USR_04: 'ts2025u4',
};

function readCSV(filename) {
  const content = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function parseBookingTime(raw, base) {
  if (!raw || raw.trim() === 'NOW') return new Date(base);
  const match = raw.trim().match(/NOW\+(\d+)m/);
  if (match) return new Date(base.getTime() + parseInt(match[1]) * 60 * 1000);
  return new Date(base);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/velorda');
  console.log('Connected');

  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}), Bicycle.deleteMany({}),
    Tariff.deleteMany({}), Booking.deleteMany({}), Application.deleteMany({}),
  ]);
  console.log('Cleared collections');


  if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });
  if (fs.existsSync(IMAGES_DIR)) {
    fs.readdirSync(IMAGES_DIR).forEach(img => {
      fs.copyFileSync(path.join(IMAGES_DIR, img), path.join(UPLOADS, img));
    });
    console.log('Images copied');
  }


  const usersCSV = readCSV('users.csv');
  const userMap  = {};
  for (const row of usersCSV) {
    const user = await User.create({
      key:      row.user_key,
      name:     row.name,
      email:    row.email.toLowerCase(),
      phone:    row.phone.startsWith('+') ? row.phone : '+' + row.phone,
      password: await bcrypt.hash(REAL_PASSWORDS[row.user_key] || 'changeme', 10),
    });
    userMap[row.user_key] = user._id;
    console.log('User:', row.email);
  }


  const categoriesCSV = readCSV('categories.csv');
  const categoryMap   = {};
  for (const row of categoriesCSV) {
    const cat = await Category.create({
      key:   row.category_key,
      name:  row.name,
      owner: userMap[row.user_ref],
    });
    categoryMap[row.category_key] = cat._id;
    console.log('Category:', row.name);
  }

  const bicyclesCSV = readCSV('bicycles.csv');
  const bicycleMap  = {};
  for (const row of bicyclesCSV) {
    const bike = await Bicycle.create({
      key:         row.bicycle_key,
      name:        row.name,
      slug:        row.slug,
      description: row.description || '',
      wear:        0,
      image:       row.pathToImage || null,
      status:      'available',
      locationX:   parseFloat(row.locationX),
      locationY:   parseFloat(row.locationY),
      category:    categoryMap[row.category_ref],
    });
    bicycleMap[row.bicycle_key] = bike._id;
    console.log('Bicycle:', row.name);
  }


  const tariffsCSV = readCSV('tariffs.csv');
  const tariffMap  = {};
  for (const row of tariffsCSV) {
    const tariff = await Tariff.create({
      key:       row.tariff_key,
      name:      row.name,
      type:      row.type,
      basePrice: parseFloat(row.basePrice),
      minPrice:  row.minPrice ? parseFloat(row.minPrice) : null,
      maxPrice:  row.maxPrice ? parseFloat(row.maxPrice) : null,
      category:  categoryMap[row.category_ref],
    });
    tariffMap[row.tariff_key] = tariff._id;
    console.log('Tariff:', row.name);
  }


  const bookingsCSV = readCSV('bookings.csv');
  const BASE_TIME   = new Date(Date.now() - 2 * 60 * 60 * 1000);
  for (const row of bookingsCSV) {
   let photos = [];
      try {
        const raw = (row.photos || '[]').trim();
        const jsonReady = raw.replace(/'/g, '"');
        const parsed = JSON.parse(jsonReady);
        photos = Array.isArray(parsed) ? parsed : [];
      } catch {
        photos = [];
      }
    await Booking.create({
      key:              row.booking_key,
      renter:           userMap[row.user_ref],
      bicycle:          bicycleMap[row.bicycle_ref],
      tariff:           tariffMap[row.tariff_ref],
      status:           'completed',
      startedAt:        parseBookingTime(row.startedAt, BASE_TIME),
      endedAt:          parseBookingTime(row.endedAt,   BASE_TIME),
      percentageOfWear: parseInt(row.percentageOfWear) || 0,
      photos,
      finalPrice:       parseFloat(row.price) || 0,
      rating:           row.rating ? parseInt(row.rating) : null,
    });
    console.log('Booking:', row.booking_key);
  }

 
  const applicationsCSV = readCSV('applications.csv');
  for (const row of applicationsCSV) {
    const applicantUser = await User.findById(userMap[row.user_ref]);
    await Application.create({
      key:            row.application_key,
      applicantName:  applicantUser.name,
      applicantPhone: applicantUser.phone,
      applicantEmail: applicantUser.email,
      applicant:      userMap[row.user_ref],
      category:       categoryMap[row.category_ref],
      status:         'pending',
    });
    console.log('Application:', row.application_key);
  }

  console.log('\n Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });