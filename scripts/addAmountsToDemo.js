const fs = require('fs');
const path = require('path');

const demoDataPath = path.join(__dirname, '..', 'src', 'data', 'demoData.json');
const publicDataPath = path.join(__dirname, '..', 'public', 'data', 'demoData.json');

console.log('Reading demo data...');
const rawData = fs.readFileSync(demoDataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log(`Found ${data.applications.length} applications`);

// Add amounts and limits to applications
let updatedCount = 0;

// Common product prices in UZS
const productPrices = [
  500000, 800000, 1000000, 1200000, 1500000, 2000000, 2500000, 
  3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000,
  8000000, 9000000, 10000000, 12000000, 15000000, 20000000
];

data.applications.forEach((app) => {
  const status = (app.status || "").toUpperCase();
  const isFinished = status === "FINISHED" || status === "COMPLETED" || status === "ACTIVE";
  const isApproved = isFinished || status === "CONFIRMED" || status === "LIMIT";
  
  // Generate amount (product price)
  if (!app.amount || app.amount === null || app.amount === 0) {
    // Use random price from our list
    const basePrice = productPrices[Math.floor(Math.random() * productPrices.length)];
    app.amount = basePrice;
  }
  
  // Generate limit for approved applications
  if (isApproved && (!app.limit || app.limit === null || app.limit === 0)) {
    // Limit is usually higher than amount (120-200% of amount)
    const multiplier = 1.2 + Math.random() * 0.8; // 1.2x to 2.0x
    app.limit = Math.round(app.amount * multiplier / 100000) * 100000; // Round to nearest 100k
  }
  
  // Generate payment_amount for finished applications
  if (isFinished && (!app.payment_amount || app.payment_amount === null || app.payment_amount === 0)) {
    // Payment amount is typically amount + interest (10-40% more)
    const interestRate = 0.1 + Math.random() * 0.3; // 10-40% interest
    app.payment_amount = Math.round(app.amount * (1 + interestRate) / 10000) * 10000; // Round to nearest 10k
  }
  
  // Update product prices if products exist
  if (app.products && app.products.length > 0) {
    const totalProductPrice = app.products.reduce((sum, p) => sum + (p.price * (p.count || 1)), 0);
    
    // If products exist but their total is 0 or doesn't match amount, update them
    if (totalProductPrice === 0 || Math.abs(totalProductPrice - app.amount) > app.amount * 0.1) {
      // Distribute the amount across products
      const productCount = app.products.length;
      const pricePerProduct = Math.floor(app.amount / productCount / 10000) * 10000;
      
      app.products.forEach((product, idx) => {
        if (idx === productCount - 1) {
          // Last product gets the remainder
          product.price = app.amount - (pricePerProduct * (productCount - 1));
        } else {
          product.price = pricePerProduct;
        }
        product.count = product.count || 1;
      });
    }
  }
  
  updatedCount++;
});

console.log(`Updated ${updatedCount} applications with amounts and limits`);

// Write back to both locations
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath, JSON.stringify(data, null, 2), 'utf-8');
fs.writeFileSync(publicDataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Done! Amounts and limits added successfully.');
console.log(`Files updated:`);
console.log(`  - ${demoDataPath}`);
console.log(`  - ${publicDataPath}`);
