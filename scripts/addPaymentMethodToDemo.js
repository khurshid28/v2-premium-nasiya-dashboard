const fs = require('fs');
const path = require('path');

const demoDataPath = path.join(__dirname, '..', 'src', 'data', 'demoData.json');
const publicDataPath = path.join(__dirname, '..', 'public', 'data', 'demoData.json');

console.log('Reading demo data...');
const rawData = fs.readFileSync(demoDataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log(`Found ${data.applications.length} applications`);

// Update statuses: change most CANCELED/rejected to FINISHED
let statusChangedCount = 0;
data.applications.forEach((app) => {
  const status = (app.status || "").toUpperCase();
  
  // Change canceled/rejected statuses to FINISHED (except keep some variety)
  if (status.includes('CANCELED') || status.includes('RAD')) {
    // Keep 10% as rejected for variety
    if (Math.random() > 0.1) {
      app.status = 'FINISHED';
      app.paid = true;
      statusChangedCount++;
    }
  }
  
  // Set paid=true for all FINISHED/COMPLETED/ACTIVE applications
  if (status === 'FINISHED' || status === 'COMPLETED' || status === 'ACTIVE') {
    app.paid = true;
  }
});

console.log(`Changed ${statusChangedCount} applications from rejected to FINISHED`);

// Add payment_method field to applications where paid is true
let updatedCount = 0;
const paymentMethods = ["Sho't faktura", "Bank orqali"];

data.applications.forEach((app, index) => {
  // Only add payment_method if paid is true and status is FINISHED, COMPLETED, or ACTIVE
  const status = (app.status || "").toUpperCase();
  const isFinished = status === "FINISHED" || status === "COMPLETED" || status === "ACTIVE";
  
  if (app.paid && isFinished) {
    // Randomly assign one of the payment methods (but make bank payment more common)
    const randomValue = Math.random();
    if (randomValue > 0.3) {
      // Use bank name if available in format "Bank orqali (BANK_NAME)"
      const bankName = app.bank?.name;
      app.payment_method = bankName ? `Bank orqali (${bankName})` : "Bank orqali";
    } else {
      app.payment_method = "Sho't faktura";
    }
    updatedCount++;
  } else {
    // Remove payment_method if it exists but shouldn't
    delete app.payment_method;
  }
});

console.log(`Updated ${updatedCount} applications with payment_method`);

// Write back to both locations
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath, JSON.stringify(data, null, 2), 'utf-8');
fs.writeFileSync(publicDataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Done! Payment method field added successfully.');
console.log(`Files updated:`);
console.log(`  - ${demoDataPath}`);
console.log(`  - ${publicDataPath}`);
