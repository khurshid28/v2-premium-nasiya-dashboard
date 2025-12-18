const fs = require('fs');
const path = require('path');

// Read demo data
const demoDataPath1 = path.join(__dirname, '../src/data/demoData.json');
const demoDataPath2 = path.join(__dirname, '../public/data/demoData.json');

const demoData1 = JSON.parse(fs.readFileSync(demoDataPath1, 'utf8'));

// Fake names
const firstNames = [
  'AZIZ', 'BOBUR', 'DAVRON', 'ELDOR', 'FARRUX', 'GULNORA', 'HUSNORA', 'IRODA',
  'JAMSHID', 'KAMOLA', 'LAZIZ', 'MALIKA', 'NODIRA', 'OTABEK', 'PARVINA',
  'QODIRA', 'RUSTAM', 'SARDOR', 'TEMUR', 'ULUGBEK', 'VALI', 'YAKUB', 'ZARINA',
  'ANVAR', 'BEKZOD', 'DILSHOD', 'ERKIN', 'FARIDA', 'GUZAL', 'HAMID'
];

const lastNames = [
  'ALIYEV', 'BOBOEV', 'CAMALOV', 'DAVLATOV', 'ERGASHEV', 'FAYZIYEV', 'GANIYEV',
  'HASANOV', 'ISMOILOV', 'JALOLOV', 'KARIMOV', 'LATIPOV', 'MAHMUDOV', 'NORMATOV',
  'ORIPOV', 'PULATOV', 'QODIROV', 'RAHIMOV', 'SADIKOV', 'TURSUNOV', 'UMAROV',
  'VALIYEV', 'YUSUPOV', 'ZAKIROV', 'ABDURAHMONOV', 'BEGMATOV', 'DJURAYEV'
];

const patronymics = [
  'AHMADOVICH', 'BOTIROVICH', 'DAVRONOVICH', 'ERKINOVICH', 'FAZLIDDINOVICH',
  'GULOMOVICH', 'HASANOVICH', 'IBROHIMOVICH', 'JAHONGIROVICH', 'KARIMOVICH',
  'LATIFOVICH', 'MAXMUDOVICH', 'NURMATOVICH', 'OLIMOVICH', 'PULOTOVICH',
  'QODIROVICH', 'RUSTAMOVICH', 'SHAVKATOVICH', 'TOHIROVICH', 'USMONOVICH',
  'VALIJONOVICH', 'XURSHIDOVICH', 'YUNUSOVICH', 'ZAKIROVICH', 'ABDUVALIYEVICH'
];

const merchantNames = [
  'TEXNO STORE', 'ELEKTRON BOZOR', 'SMART SHOP', 'GADGET MARKET', 'TECH PLAZA',
  'DIGITAL WORLD', 'MOBILE CENTER', 'PREMIUM ELECTRONICS', 'MODERN TECH', 'CYBER STORE',
  'TECH HOUSE', 'INNOVATION HUB', 'FUTURE SHOP', 'BRAND STORE', 'ELITE ELECTRONICS'
];

const fillialNames = [
  'MARKAZ FILIALI', 'SHAHAR FILIALI', 'TUMAN FILIALI', 'DO\'KONI №1', 'DO\'KONI №2',
  'SAVDO MARKAZI', 'MEGA FILIALI', 'YANGI FILIAL', 'ASOSIY FILIAL', 'MINTAQAVIY FILIAL',
  'BOZOR FILIALI', 'PLAZA FILIALI', 'CENTER FILIALI', 'MAXSUS FILIAL', 'VILOYAT FILIALI'
];

const companyNames = [
  'PREMIUM TECH', 'SMART SOLUTIONS', 'DIGITAL SYSTEMS', 'MODERN TRADE', 'TECH GROUP',
  'INNOVATION LLC', 'FUTURE SYSTEMS', 'CYBER SOLUTIONS', 'ELITE TRADE', 'BRAND GROUP',
  'TECH COMPANY', 'DIGITAL TRADE', 'SMART GROUP', 'PREMIUM SOLUTIONS', 'MODERN SYSTEMS'
];

const bankNames = [
  'XALQ BANKI',
  'ASAKA BANK',
  'AGROBANK',
  'UZPROMSTROYBANK',
  'KAPITALBANK',
  'IPOTEKA-BANK',
  'ALOQABANK',
  'DAVR BANK',
  'INFIN BANK',
  'TURKISTON BANK'
];

const regions = [
  'TOSHKENT SHAHAR',
  'TOSHKENT VILOYAT',
  'SAMARQAND',
  'BUXORO',
  'XORAZM',
  'QASHQADARYO',
  'SURXONDARYO',
  'ANDIJON',
  'FARG\'ONA',
  'NAMANGAN',
  'SIRDARYO',
  'JIZZAX',
  'NAVOIY'
];

const districts = [
  'MIRZO ULUG\'BEK TUMANI',
  'YUNUSOBOD TUMANI',
  'YAKKASAROY TUMANI',
  'CHILONZOR TUMANI',
  'SERGELI TUMANI',
  'YANGIHAYT TUMANI',
  'BEKOBOD TUMANI',
  'OQTOSH TUMANI',
  'MARKAZIY TUMAN',
  'SHAHAR MARKAZI'
];

const streets = [
  'Navoiy ko\'chasi',
  'Alisher Navoiy shoh ko\'chasi',
  'Mustaqillik shoh ko\'chasi',
  'Yangi hayot ko\'chasi',
  'Do\'stlik ko\'chasi',
  'Taraqqiyot ko\'chasi',
  'Buyuk ipak yo\'li ko\'chasi',
  'Amir Temur shoh ko\'chasi',
  'Furqat ko\'chasi',
  'Beruniy ko\'chasi'
];

// Generate random phone
function generatePhone() {
  const prefixes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `+998${prefix}${number}`;
}

// Generate random passport
function generatePassport() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const number = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `${letter1}${letter2}${number}`;
}

// Generate random INN (9 digits)
function generateINN() {
  return String(Math.floor(Math.random() * 900000000) + 100000000);
}

// Generate random NDS (12 digits)
function generateNDS() {
  return String(Math.floor(Math.random() * 900000000000) + 100000000000);
}

// Generate random account number (20 digits)
function generateAccountNumber() {
  return '20208' + String(Math.floor(Math.random() * 900000000000000) + 100000000000000);
}

// Generate random MFO (5 digits)
function generateMFO() {
  return '00' + String(Math.floor(Math.random() * 900) + 100);
}

// Generate random name
function generateFullName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const patronymic = patronymics[Math.floor(Math.random() * patronymics.length)];
  return `${firstName} ${lastName} ${patronymic}`;
}

// Anonymize address (replace numbers with random ones)
function anonymizeAddress(address) {
  if (!address) return address;
  
  // Generate completely new anonymous address
  const region = regions[Math.floor(Math.random() * regions.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const houseNumber = Math.floor(Math.random() * 200 + 1);
  
  return `${region}, ${district}, ${street}, ${houseNumber}-uy`;
}

// Generate random bank name
function generateBankName() {
  const region = regions[Math.floor(Math.random() * regions.length)];
  const bank = bankNames[Math.floor(Math.random() * bankNames.length)];
  return `${region}, ${bank}`;
}

console.log('Anonymizing demo data...');

// Track unique values to avoid duplicates
const usedPhones = new Set();
const usedPassports = new Set();
const usedINNs = new Set();

// Create mapping for merchants, fillials, users
const merchantMap = new Map();
const fillialMap = new Map();
const userMap = new Map();

let count = 0;

demoData1.applications = demoData1.applications.map(app => {
  // Anonymize applicant data
  app.fullname = generateFullName();
  
  // Generate unique phone
  let phone = generatePhone();
  while (usedPhones.has(phone)) {
    phone = generatePhone();
  }
  usedPhones.add(phone);
  app.phone = phone;
  
  if (app.phone2) {
    let phone2 = generatePhone();
    while (usedPhones.has(phone2)) {
      phone2 = generatePhone();
    }
    usedPhones.add(phone2);
    app.phone2 = phone2;
  }
  
  // Generate unique passport
  let passport = generatePassport();
  while (usedPassports.has(passport)) {
    passport = generatePassport();
  }
  usedPassports.add(passport);
  app.passport = passport;

  // Anonymize merchant
  if (app.merchant) {
    if (!merchantMap.has(app.merchant.id)) {
      merchantMap.set(app.merchant.id, {
        name: merchantNames[merchantMap.size % merchantNames.length]
      });
    }
    app.merchant.name = merchantMap.get(app.merchant.id).name;
  }

  // Anonymize fillial
  if (app.fillial) {
    if (!fillialMap.has(app.fillial.id)) {
      const companyType = ['MCHJ', 'QMJ', 'AJ', 'OOO'][Math.floor(Math.random() * 4)];
      const companyName = companyNames[fillialMap.size % companyNames.length];
      
      let inn = generateINN();
      while (usedINNs.has(inn)) {
        inn = generateINN();
      }
      usedINNs.add(inn);
      
      fillialMap.set(app.fillial.id, {
        name: `"${companyName}" ${companyType}`,
        inn: inn,
        nds: generateNDS(),
        hisob_raqam: generateAccountNumber(),
        mfo: generateMFO(),
        director_name: generateFullName(),
        director_phone: generatePhone()
      });
    }
    
    const fillialData = fillialMap.get(app.fillial.id);
    app.fillial.name = fillialData.name;
    if (app.fillial.inn) app.fillial.inn = fillialData.inn;
    if (app.fillial.nds) app.fillial.nds = fillialData.nds;
    if (app.fillial.hisob_raqam) app.fillial.hisob_raqam = fillialData.hisob_raqam;
    if (app.fillial.mfo) app.fillial.mfo = fillialData.mfo;
    if (app.fillial.director_name) app.fillial.director_name = fillialData.director_name;
    if (app.fillial.director_phone) app.fillial.director_phone = fillialData.director_phone;
    
    // Anonymize fillial address and bank name
    if (app.fillial.address) {
      app.fillial.address = anonymizeAddress(app.fillial.address);
    }
    if (app.fillial.bank_name) {
      app.fillial.bank_name = generateBankName();
    }
  }

  // Anonymize user (agent)
  if (app.user) {
    if (!userMap.has(app.user.id)) {
      userMap.set(app.user.id, {
        fullname: generateFullName(),
        phone: generatePhone()
      });
    }
    
    const userData = userMap.get(app.user.id);
    app.user.fullname = userData.fullname;
    if (app.user.phone) app.user.phone = userData.phone;
  }

  count++;
  if (count % 50 === 0) {
    console.log(`Processed ${count} applications...`);
  }

  return app;
});

console.log(`\nAnonymized ${count} applications`);
console.log(`Unique merchants: ${merchantMap.size}`);
console.log(`Unique fillials: ${fillialMap.size}`);
console.log(`Unique users: ${userMap.size}`);

// Anonymize merchants array
if (demoData1.merchants && Array.isArray(demoData1.merchants)) {
  console.log('\nAnonymizing merchants array...');
  demoData1.merchants = demoData1.merchants.map(merchant => {
    if (merchantMap.has(merchant.id)) {
      merchant.name = merchantMap.get(merchant.id).name;
    } else {
      merchant.name = merchantNames[Math.floor(Math.random() * merchantNames.length)];
    }
    return merchant;
  });
  console.log(`Anonymized ${demoData1.merchants.length} merchants`);
}

// Anonymize fillials array
if (demoData1.fillials && Array.isArray(demoData1.fillials)) {
  console.log('\nAnonymizing fillials array...');
  demoData1.fillials = demoData1.fillials.map(fillial => {
    // Anonymize address and bank name
    if (fillial.address) {
      fillial.address = anonymizeAddress(fillial.address);
    }
    if (fillial.bank_name) {
      fillial.bank_name = generateBankName();
    }
    
    if (fillialMap.has(fillial.id)) {
      const fillialData = fillialMap.get(fillial.id);
      fillial.name = fillialData.name;
      if (fillial.inn) fillial.inn = fillialData.inn;
      if (fillial.nds) fillial.nds = fillialData.nds;
      if (fillial.hisob_raqam) fillial.hisob_raqam = fillialData.hisob_raqam;
      if (fillial.mfo) fillial.mfo = fillialData.mfo;
      if (fillial.director_name) fillial.director_name = fillialData.director_name;
      if (fillial.director_phone) fillial.director_phone = fillialData.director_phone;
    } else {
      const companyType = ['MCHJ', 'QMJ', 'AJ', 'OOO'][Math.floor(Math.random() * 4)];
      const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
      fillial.name = `"${companyName}" ${companyType}`;
      
      if (fillial.inn) {
        let inn = generateINN();
        while (usedINNs.has(inn)) {
          inn = generateINN();
        }
        usedINNs.add(inn);
        fillial.inn = inn;
      }
      
      if (fillial.nds) fillial.nds = generateNDS();
      if (fillial.hisob_raqam) fillial.hisob_raqam = generateAccountNumber();
      if (fillial.mfo) fillial.mfo = generateMFO();
      if (fillial.director_name) fillial.director_name = generateFullName();
      if (fillial.director_phone) fillial.director_phone = generatePhone();
    }
    
    // Anonymize nested merchant
    if (fillial.merchant) {
      if (merchantMap.has(fillial.merchant.id)) {
        fillial.merchant.name = merchantMap.get(fillial.merchant.id).name;
      } else {
        fillial.merchant.name = merchantNames[Math.floor(Math.random() * merchantNames.length)];
      }
    }
    
    return fillial;
  });
  console.log(`Anonymized ${demoData1.fillials.length} fillials`);
}

// Anonymize agents array
if (demoData1.agents && Array.isArray(demoData1.agents)) {
  console.log('\nAnonymizing agents array...');
  demoData1.agents = demoData1.agents.map(agent => {
    agent.fullname = generateFullName();
    
    if (agent.phone) {
      let phone = generatePhone();
      while (usedPhones.has(phone)) {
        phone = generatePhone();
      }
      usedPhones.add(phone);
      agent.phone = phone;
    }
    
    // Anonymize nested fillials
    if (agent.fillials && Array.isArray(agent.fillials)) {
      agent.fillials = agent.fillials.map(fillial => {
        // Anonymize address and bank name
        if (fillial.address) {
          fillial.address = anonymizeAddress(fillial.address);
        }
        if (fillial.bank_name) {
          fillial.bank_name = generateBankName();
        }
        
        if (fillialMap.has(fillial.id)) {
          const fillialData = fillialMap.get(fillial.id);
          fillial.name = fillialData.name;
          if (fillial.inn) fillial.inn = fillialData.inn;
          if (fillial.nds) fillial.nds = fillialData.nds;
          if (fillial.hisob_raqam) fillial.hisob_raqam = fillialData.hisob_raqam;
          if (fillial.mfo) fillial.mfo = fillialData.mfo;
          if (fillial.director_name) fillial.director_name = fillialData.director_name;
          if (fillial.director_phone) fillial.director_phone = fillialData.director_phone;
        }
        return fillial;
      });
    }
    
    return agent;
  });
  console.log(`Anonymized ${demoData1.agents.length} agents`);
}

// Write updated data
console.log('\nWriting updated data...');
fs.writeFileSync(demoDataPath1, JSON.stringify(demoData1, null, 2));
fs.writeFileSync(demoDataPath2, JSON.stringify(demoData1, null, 2));

console.log('Done! All personal data has been anonymized.');
