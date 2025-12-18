const fs = require('fs');
const path = require('path');

// Read demo data
const demoDataPath1 = path.join(__dirname, '../src/data/demoData.json');
const demoDataPath2 = path.join(__dirname, '../public/data/demoData.json');

const demoData1 = JSON.parse(fs.readFileSync(demoDataPath1, 'utf8'));

function generatePayments(application) {
  if (!application.amount || !application.expired_month || !application.payment_amount) {
    return [];
  }

  const months = parseInt(application.expired_month);
  const totalAmount = application.payment_amount;
  const monthlyPayment = Math.round(totalAmount / months);
  
  const payments = [];
  const createdDate = new Date(application.createdAt);
  
  let remainingDebt = totalAmount;
  
  for (let i = 0; i < months; i++) {
    const paymentDate = new Date(createdDate);
    paymentDate.setMonth(paymentDate.getMonth() + i + 1);
    
    const isLast = i === months - 1;
    const totalPayment = isLast ? remainingDebt : monthlyPayment;
    const principalAmount = Math.round(totalPayment * 0.75); // 75% asosiy qarz
    
    remainingDebt -= totalPayment;
    
    // FINISHED aplikatsiyalarda ko'pchilik to'lovlar amalga oshirilgan bo'lsin
    const isPaid = application.status === 'FINISHED' ? (i < months - 2 || Math.random() > 0.3) : false;
    
    payments.push({
      date: paymentDate.toISOString(),
      prAmount: principalAmount,
      totalAmount: totalPayment,
      remainingMainDebt: Math.max(0, remainingDebt),
      paid: isPaid
    });
  }
  
  return payments;
}

function generatePaymentHistory(application) {
  if (!application.payments || application.status !== 'FINISHED') {
    return [];
  }

  const history = [];
  const providers = ['Payme', 'Click', 'Uzum', 'Apelsin'];
  
  // Faqat to'langan to'lovlar uchun history yaratamiz
  application.payments.forEach((payment, index) => {
    if (payment.paid) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const paymentDate = new Date(payment.date);
      // To'lov sanasidan 1-5 kun oldin to'langan
      paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 5) - 1);
      
      history.push({
        id: `PMT${application.id}${String(index + 1).padStart(3, '0')}`,
        date: paymentDate.toISOString(),
        amount: payment.totalAmount,
        provider: provider,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`,
        status: 'SUCCESS'
      });
    }
  });
  
  return history;
}

console.log('Adding payments and payment history to applications...');

let paymentsCount = 0;
let historyCount = 0;

demoData1.applications = demoData1.applications.map(app => {
  // Payments qo'shamiz
  const payments = generatePayments(app);
  if (payments.length > 0) {
    app.payments = payments;
    paymentsCount++;
  }
  
  // Payment history qo'shamiz
  const history = generatePaymentHistory(app);
  if (history.length > 0) {
    app.paymentHistory = history;
    historyCount++;
  }
  
  return app;
});

console.log(`Updated ${paymentsCount} applications with payments`);
console.log(`Updated ${historyCount} applications with payment history`);

// Write updated data
console.log('Writing updated data...');
fs.writeFileSync(demoDataPath1, JSON.stringify(demoData1, null, 2));
fs.writeFileSync(demoDataPath2, JSON.stringify(demoData1, null, 2));

console.log('Done!');
