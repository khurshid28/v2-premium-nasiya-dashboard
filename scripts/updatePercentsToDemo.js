const fs = require('fs');
const path = require('path');

const demoDataPath = path.join(__dirname, '..', 'src', 'data', 'demoData.json');
const publicDataPath = path.join(__dirname, '..', 'public', 'data', 'demoData.json');

console.log('Reading demo data...');
const rawData = fs.readFileSync(demoDataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log(`Found ${data.applications.length} applications`);

// Percent rates based on months
const percentRates = {
  '3': 25,
  '6': 30,
  '9': 34,
  '12': 38
};

// Update percent and payment_amount for all applications
let updatedCount = 0;

data.applications.forEach((app) => {
  const status = (app.status || "").toUpperCase();
  const isFinished = status === "FINISHED" || status === "COMPLETED" || status === "ACTIVE";
  const isApproved = isFinished || status === "CONFIRMED" || status === "LIMIT";
  
  // Set percent based on expired_month
  if (app.expired_month && percentRates[app.expired_month]) {
    app.percent = percentRates[app.expired_month];
  } else if (app.expired_month) {
    // Default to 12 months rate if month not in our list
    app.percent = 38;
  }
  
  // Calculate payment_amount correctly: amount * (100 + percent) / 100
  if (isFinished && app.amount && app.amount > 0 && app.percent) {
    app.payment_amount = Math.round(app.amount * (100 + app.percent) / 100);
  }
  
  updatedCount++;
});

console.log(`Updated ${updatedCount} applications with percent and payment_amount`);

// Write back to both locations
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath, JSON.stringify(data, null, 2), 'utf-8');
fs.writeFileSync(publicDataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Done! Percent and payment_amount updated successfully.');
console.log(`Files updated:`);
console.log(`  - ${demoDataPath}`);
console.log(`  - ${publicDataPath}`);
