const fs = require('fs');
const path = require('path');

const demoDataPath = path.join(__dirname, '..', 'src', 'data', 'demoData.json');
const publicDataPath = path.join(__dirname, '..', 'public', 'data', 'demoData.json');

console.log('Reading demo data...');
const rawData = fs.readFileSync(demoDataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log(`Found ${data.applications.length} applications`);

// Product names for different price ranges
const productTemplates = [
  // 500k - 2M range
  { names: ['Samsung A-series', 'Redmi Note', 'Realme smartphone', 'OPPO A-series'], range: [500000, 2000000] },
  // 2M - 5M range
  { names: ['Samsung Galaxy', 'iPhone SE', 'Xiaomi flagship', 'Sony headphones', 'JBL speaker'], range: [2000000, 5000000] },
  // 5M - 10M range
  { names: ['Samsung S-series', 'iPhone 13', 'MacBook Air', 'Dell laptop', 'HP laptop', 'Artel TV'], range: [5000000, 10000000] },
  // 10M+ range
  { names: ['iPhone 14 Pro', 'MacBook Pro', 'Samsung TV', 'LG OLED TV', 'Gaming laptop'], range: [10000000, 50000000] }
];

function getProductName(amount) {
  const template = productTemplates.find(t => amount >= t.range[0] && amount <= t.range[1]) || productTemplates[0];
  return template.names[Math.floor(Math.random() * template.names.length)];
}

// Add products to applications that don't have them
let addedCount = 0;

data.applications.forEach((app, index) => {
  if (app.amount && app.amount > 0) {
    // If no products or empty products array
    if (!app.products || app.products.length === 0) {
      const productCount = Math.random() > 0.7 ? 2 : 1; // 70% single product, 30% two products
      app.products = [];
      
      if (productCount === 1) {
        // Single product
        app.products.push({
          id: 10000 + index,
          name: getProductName(app.amount),
          price: app.amount,
          count: 1,
          hash: null,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt || app.createdAt,
          zayavka_id: app.id,
          bankRequestid: app.request_id
        });
      } else {
        // Two products
        const price1 = Math.floor(app.amount * (0.4 + Math.random() * 0.2) / 10000) * 10000;
        const price2 = app.amount - price1;
        
        app.products.push({
          id: 10000 + index * 2,
          name: getProductName(price1),
          price: price1,
          count: 1,
          hash: null,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt || app.createdAt,
          zayavka_id: app.id,
          bankRequestid: app.request_id
        });
        
        app.products.push({
          id: 10000 + index * 2 + 1,
          name: getProductName(price2),
          price: price2,
          count: 1,
          hash: null,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt || app.createdAt,
          zayavka_id: app.id,
          bankRequestid: app.request_id
        });
      }
      
      addedCount++;
    }
  }
});

console.log(`Added products to ${addedCount} applications`);

// Write back to both locations
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath, JSON.stringify(data, null, 2), 'utf-8');
fs.writeFileSync(publicDataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Done! Products added successfully.');
console.log(`Files updated:`);
console.log(`  - ${demoDataPath}`);
console.log(`  - ${publicDataPath}`);
