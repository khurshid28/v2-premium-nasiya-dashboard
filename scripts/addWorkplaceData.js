const fs = require('fs');
const path = require('path');

// Read demo data
const demoDataPath1 = path.join(__dirname, '../src/data/demoData.json');
const demoDataPath2 = path.join(__dirname, '../public/data/demoData.json');

const demoData1 = JSON.parse(fs.readFileSync(demoDataPath1, 'utf8'));

const companyNames = [
  'SAMSUNG ELECTRONICS', 'LG ELECTRONICS', 'ARTEL SAVDO', 'TEXNOMART', 'MAKRO MARKET',
  'MEDIAPARK', 'ATLAS TRADE', 'UNIVERSAM', 'GOODZONE', 'ALIFSHOP',
  'SELLO MARKET', 'TECHNODOM', 'SHARQ YULDUZI', 'BUYUK SAVDO', 'PREMIUM MARKET'
];

const positions = [
  'Sotuvchi', 'Omborchi', 'Kassir', 'Menejer', 'Administrator',
  'Hisobchi', 'Direktor yordamchisi', 'Xavfsizlik xodimi', 'IT mutaxassis', 'Marketer'
];

const regions = [
  'TOSHKENT SHAHAR', 'TOSHKENT VILOYAT', 'SAMARQAND', 'BUXORO', 'XORAZM',
  'QASHQADARYO', 'SURXONDARYO', 'ANDIJON', 'FARG\'ONA', 'NAMANGAN',
  'SIRDARYO', 'JIZZAX', 'NAVOIY'
];

const districts = [
  'MIRZO ULUG\'BEK TUMANI', 'YUNUSOBOD TUMANI', 'YAKKASAROY TUMANI',
  'CHILONZOR TUMANI', 'SERGELI TUMANI', 'YANGIHAYT TUMANI',
  'BEKOBOD TUMANI', 'OQTOSH TUMANI', 'MARKAZIY TUMAN', 'SHAHAR MARKAZI'
];

const streets = [
  'Navoiy ko\'chasi', 'Alisher Navoiy shoh ko\'chasi', 'Mustaqillik shoh ko\'chasi',
  'Yangi hayot ko\'chasi', 'Do\'stlik ko\'chasi', 'Taraqqiyot ko\'chasi',
  'Buyuk ipak yo\'li ko\'chasi', 'Amir Temur shoh ko\'chasi', 'Furqat ko\'chasi',
  'Beruniy ko\'chasi'
];

// Generate random INN (9 digits)
function generateINN() {
  return String(Math.floor(Math.random() * 900000000) + 100000000);
}

// Generate random phone
function generatePhone() {
  const prefixes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `+998${prefix}${number}`;
}

// Generate workplace data
function generateWorkplace() {
  const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
  const companyType = ['MCHJ', 'QMJ', 'AJ', 'OOO'][Math.floor(Math.random() * 4)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const houseNumber = Math.floor(Math.random() * 200 + 1);
  
  return {
    company_name: `"${companyName}" ${companyType}`,
    position: positions[Math.floor(Math.random() * positions.length)],
    work_experience: Math.floor(Math.random() * 10 + 1) + ' yil',
    monthly_income: (Math.floor(Math.random() * 50 + 20) * 100000), // 2M - 7M
    address: `${region}, ${district}, ${street}, ${houseNumber}-uy`,
    inn: generateINN(),
    phone: generatePhone(),
    director_name: null, // Optional
    work_schedule: ['8:00-17:00', '9:00-18:00', '10:00-19:00'][Math.floor(Math.random() * 3)]
  };
}

console.log('Adding workplace data to applications...');

let count = 0;

demoData1.applications = demoData1.applications.map(app => {
  // Add workplace for 80% of applications
  if (Math.random() > 0.2) {
    app.workplace = generateWorkplace();
  }
  
  count++;
  if (count % 50 === 0) {
    console.log(`Processed ${count} applications...`);
  }
  
  return app;
});

console.log(`\nAdded workplace to ~${Math.floor(count * 0.8)} applications out of ${count}`);

// Write updated data
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath1, JSON.stringify(demoData1, null, 2));
fs.writeFileSync(demoDataPath2, JSON.stringify(demoData1, null, 2));

console.log('Done!');
