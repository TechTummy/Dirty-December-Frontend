export const contributionHistory = [
  { 
    month: 'January', 
    amount: 5000, 
    status: 'confirmed', 
    date: '2024-01-15',
    transactionId: 'DD-2024-JAN-001542',
    paymentMethod: 'Bank Transfer',
    reference: 'FLW-234891234',
    time: '14:23 PM'
  },
  { 
    month: 'February', 
    amount: 5000, 
    status: 'confirmed', 
    date: '2024-02-15',
    transactionId: 'DD-2024-FEB-001789',
    paymentMethod: 'Card Payment',
    reference: 'PSK-567234891',
    time: '09:45 AM'
  },
  { 
    month: 'March', 
    amount: 5000, 
    status: 'confirmed', 
    date: '2024-03-15',
    transactionId: 'DD-2024-MAR-002103',
    paymentMethod: 'USSD',
    reference: 'GTB-789456123',
    time: '16:12 PM'
  },
  { 
    month: 'April', 
    amount: 5000, 
    status: 'pending', 
    date: '2024-04-15',
    transactionId: 'DD-2024-APR-002456',
    paymentMethod: 'Bank Transfer',
    reference: 'FLW-891234567',
    time: '11:30 AM'
  },
];

export const bulkItems = [
  { name: 'Premium Rice (25kg bag)', retailPrice: 45000, bulkPrice: 32000 },
  { name: 'Vegetable Oil (5L)', retailPrice: 12000, bulkPrice: 8500 },
  { name: 'Premium Beans (5kg)', retailPrice: 8000, bulkPrice: 5500 },
  { name: 'Tomato Paste (12 tins)', retailPrice: 6000, bulkPrice: 4200 },
  { name: 'Seasoning Pack', retailPrice: 5000, bulkPrice: 3500 },
  { name: 'Spaghetti (12 packs)', retailPrice: 9000, bulkPrice: 6300 },
];

export const announcements = [
  {
    id: 1,
    title: 'December Distribution Date Set!',
    message: 'We\'re excited to announce that provisions will be distributed on December 20th, 2024. Please mark your calendars!',
    date: '2024-11-25',
    priority: 'high'
  },
  {
    id: 2,
    title: 'New Item Added to Package',
    message: 'Based on member feedback, we\'ve added premium seasoning packs to the December package at no extra cost!',
    date: '2024-11-20',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Payment Reminder',
    message: 'Please ensure November contributions are completed by the end of the month to remain eligible for the full package.',
    date: '2024-11-15',
    priority: 'medium'
  },
];

export const chatMessages = [
  {
    id: 1,
    user: 'Chioma A.',
    message: 'Just made my contribution! Can\'t wait for December!',
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    user: 'Emeka O.',
    message: 'The value we\'re getting is amazing! Saved so much money this year.',
    timestamp: '11:15 AM',
  },
  {
    id: 3,
    user: 'Blessing M.',
    message: 'Anyone else excited about the new seasoning pack? 🎉',
    timestamp: '2:45 PM',
  },
];

export const calculateTotalSavings = () => {
  const totalRetail = bulkItems.reduce((sum, item) => sum + item.retailPrice, 0);
  const totalBulk = bulkItems.reduce((sum, item) => sum + item.bulkPrice, 0);
  return totalRetail - totalBulk;
};