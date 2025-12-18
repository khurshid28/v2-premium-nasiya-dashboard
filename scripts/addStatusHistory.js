const fs = require('fs');
const path = require('path');

// Read demo data
const demoDataPath1 = path.join(__dirname, '../src/data/demoData.json');
const demoDataPath2 = path.join(__dirname, '../public/data/demoData.json');

const demoData1 = JSON.parse(fs.readFileSync(demoDataPath1, 'utf8'));

// Status flow configuration
const statusFlow = {
  'FINISHED': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT',
    'WAITING_BANK_UPDATE',
    'WAITING_BANK_CONFIRM',
    'CONFIRMED',
    'FINISHED'
  ],
  'CONFIRMED': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT',
    'WAITING_BANK_UPDATE',
    'WAITING_BANK_CONFIRM',
    'CONFIRMED'
  ],
  'CANCELED_BY_SCORING': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'CANCELED_BY_SCORING'
  ],
  'CANCELED_BY_CLIENT': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'CANCELED_BY_CLIENT'
  ],
  'CANCELED_BY_DAILY': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT',
    'CANCELED_BY_DAILY'
  ],
  'WAITING_BANK_CONFIRM': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT',
    'WAITING_BANK_UPDATE',
    'WAITING_BANK_CONFIRM'
  ],
  'WAITING_BANK_UPDATE': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT',
    'WAITING_BANK_UPDATE'
  ],
  'ADDED_PRODUCT': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT',
    'ADDED_PRODUCT'
  ],
  'LIMIT': [
    'CREATED',
    'ADDED_DETAIL',
    'WAITING_SCORING',
    'LIMIT'
  ]
};

function generateStatusHistory(application) {
  const currentStatus = application.status || 'CREATED';
  const statuses = statusFlow[currentStatus] || ['CREATED'];
  
  const createdDate = new Date(application.createdAt);
  const history = [];
  
  statuses.forEach((status, index) => {
    const date = new Date(createdDate);
    // Add random minutes/hours between statuses (1-120 minutes)
    date.setMinutes(date.getMinutes() + (index * Math.floor(Math.random() * 120 + 10)));
    
    // Determine what changed for each status
    let changes = [];
    
    switch(status) {
      case 'CREATED':
        changes = [
          { field: 'fullname', value: application.fullname, label: 'F.I.O' },
          { field: 'phone', value: application.phone, label: 'Telefon' },
          { field: 'passport', value: application.passport, label: 'Pasport' }
        ];
        break;
      case 'ADDED_DETAIL':
        if (application.phone2) {
          changes.push({ field: 'phone2', value: application.phone2, label: 'Qo\'shimcha telefon' });
        }
        if (application.fillial) {
          changes.push({ field: 'fillial', value: application.fillial.name, label: 'Fillial' });
        }
        if (application.merchant) {
          changes.push({ field: 'merchant', value: application.merchant.name, label: 'Merchant' });
        }
        break;
      case 'WAITING_SCORING':
        changes = [
          { field: 'scoring', value: 'Jarayonda', label: 'Skoring' }
        ];
        break;
      case 'LIMIT':
        if (application.limit) {
          changes.push({ field: 'limit', value: application.limit, label: 'Limit', isAmount: true });
        }
        if (application.expired_month) {
          changes.push({ field: 'expired_month', value: application.expired_month + ' oy', label: 'Muddat' });
        }
        break;
      case 'ADDED_PRODUCT':
        if (application.products && application.products.length > 0) {
          application.products.forEach((product, idx) => {
            changes.push({ 
              field: 'product_' + idx, 
              value: `${product.name} (${product.price} so'm)`, 
              label: `Mahsulot ${idx + 1}` 
            });
          });
        }
        if (application.amount) {
          changes.push({ field: 'amount', value: application.amount, label: 'Summa', isAmount: true });
        }
        break;
      case 'WAITING_BANK_UPDATE':
        if (application.payment_amount) {
          changes.push({ field: 'payment_amount', value: application.payment_amount, label: 'To\'lov summasi', isAmount: true });
        }
        if (application.percent) {
          changes.push({ field: 'percent', value: application.percent + '%', label: 'Foiz stavkasi' });
        }
        break;
      case 'WAITING_BANK_CONFIRM':
        changes = [
          { field: 'bank_confirm', value: 'Kutilmoqda', label: 'Bank tasdig\'i' }
        ];
        break;
      case 'CONFIRMED':
        if (application.payment_method) {
          changes.push({ field: 'payment_method', value: application.payment_method, label: 'To\'lov usuli' });
        }
        changes.push({ field: 'confirmed', value: 'Tasdiqlandi', label: 'Holat' });
        break;
      case 'FINISHED':
        changes = [
          { field: 'paid', value: application.paid ? 'Ha' : 'Yo\'q', label: 'To\'landi' },
          { field: 'finished', value: 'Yakunlandi', label: 'Holat' }
        ];
        break;
      case 'CANCELED_BY_SCORING':
        if (application.canceled_reason) {
          changes.push({ field: 'canceled_reason', value: application.canceled_reason, label: 'Sabab' });
        }
        break;
      case 'CANCELED_BY_CLIENT':
        changes = [
          { field: 'canceled_reason', value: 'Mijoz tomonidan bekor qilindi', label: 'Sabab' }
        ];
        break;
      case 'CANCELED_BY_DAILY':
        changes = [
          { field: 'canceled_reason', value: 'Kunlik limit oshib ketdi', label: 'Sabab' }
        ];
        break;
    }
    
    history.push({
      status: status,
      date: date.toISOString(),
      timestamp: date.getTime(),
      changes: changes
    });
  });
  
  return history;
}

console.log('Adding status history to applications...');

let count = 0;

demoData1.applications = demoData1.applications.map(app => {
  app.statusHistory = generateStatusHistory(app);
  count++;
  
  if (count % 50 === 0) {
    console.log(`Processed ${count} applications...`);
  }
  
  return app;
});

console.log(`\nAdded status history to ${count} applications`);

// Write updated data
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath1, JSON.stringify(demoData1, null, 2));
fs.writeFileSync(demoDataPath2, JSON.stringify(demoData1, null, 2));

console.log('Done!');
