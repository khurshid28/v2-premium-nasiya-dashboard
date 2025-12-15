const fs = require('fs');
const path = require('path');

// Read the demo data
const demoDataPath = path.join(__dirname, '../public/data/demoData.json');
const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));

// Payment providers
const providers = ['PAYME', 'PLUM', 'AUTO', 'MIB'];
const statuses = ['completed', 'pending', 'failed'];

// Helper function to generate random payment history
function generatePaymentHistory(applicationId, paymentAmount, numPayments = 3) {
  const history = [];
  const baseAmount = paymentAmount / numPayments;
  
  for (let i = 0; i < numPayments; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const status = i === 0 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.round(baseAmount + (Math.random() * 100000 - 50000));
    
    const date = new Date();
    date.setDate(date.getDate() - (numPayments - i) * 7); // Weekly payments
    
    history.push({
      id: `PAY${applicationId}_${i + 1}`,
      date: date.toISOString(),
      amount: amount,
      provider: provider,
      transactionId: status === 'completed' ? `TXN${Math.random().toString(36).substring(2, 11).toUpperCase()}` : undefined,
      status: status
    });
  }
  
  return history;
}

// Add payment history to applications
let updatedCount = 0;
demoData.applications.forEach((app, index) => {
  // Only add payment history to completed/active applications
  if (app.status === 'FINISHED' || app.status === 'COMPLETED' || app.status === 'ACTIVE') {
    const numPayments = Math.floor(Math.random() * 3) + 2; // 2-4 payments
    app.paymentHistory = generatePaymentHistory(app.id, app.payment_amount || app.amount, numPayments);
    
    // Mark some payments as paid in the payments schedule
    if (app.payments && app.payments.length > 0) {
      const numPaid = Math.min(numPayments, app.payments.length);
      for (let i = 0; i < numPaid; i++) {
        app.payments[i].paid = true;
      }
    }
    
    updatedCount++;
  }
});

// Write back to file
fs.writeFileSync(demoDataPath, JSON.stringify(demoData, null, 2));

console.log(`✅ Added payment history to ${updatedCount} applications!`);
console.log(`📊 Total applications: ${demoData.applications.length}`);
