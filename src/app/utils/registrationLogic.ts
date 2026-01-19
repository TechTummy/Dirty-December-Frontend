export interface RegistrationStatus {
  isOpen: boolean;
  isMidCycle: boolean;
  currentMonth: number;
  monthsOwed: number;
  totalOwed: number;
  message: string;
}

export function getRegistrationStatus(): RegistrationStatus {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  // Registration window: January 1-31
  const isInJanuary = currentMonth === 1;
  const isBeforeJanEnd = currentDay <= 31;
  const isRegistrationOpen = isInJanuary && isBeforeJanEnd;

  // Mid-cycle detection (after January 31)
  const isMidCycle = !isRegistrationOpen && currentMonth <= 12;

  // Calculate months owed (from January to current month)
  const monthsOwed = isMidCycle ? currentMonth : 0;
  const monthlyContribution = 5000;
  const totalOwed = monthsOwed * monthlyContribution;

  let message = '';
  if (isRegistrationOpen && currentDay > 1) {
    message = `Registration for Belleza Detty December ${currentYear} ends on January 31st. Join now!`;
  } else if (isMidCycle) {
    message = `Registration for Belleza Detty December ${currentYear} is closed. Choose an option below:`;
  } else if (isRegistrationOpen && currentDay === 1) {
    message = `Welcome to Belleza Detty December ${currentYear}! Registration is now open.`;
  }

  return {
    isOpen: isRegistrationOpen,
    isMidCycle,
    currentMonth,
    monthsOwed,
    totalOwed,
    message
  };
}

export function calculateProportionalValue(monthsPaid: number): {
  totalContributed: number;
  estimatedValue: number;
  savings: number;
  isFullCycle: boolean;
} {
  const monthlyContribution = 5000;
  const fullYearValue = 85700;
  const fullYearContribution = 60000;

  const totalContributed = monthsPaid * monthlyContribution;
  const isFullCycle = monthsPaid >= 12;

  // Calculate proportional value (maintaining ~42% savings rate)
  const estimatedValue = isFullCycle
    ? fullYearValue
    : Math.round((totalContributed / fullYearContribution) * fullYearValue);

  const savings = estimatedValue - totalContributed;

  return {
    totalContributed,
    estimatedValue,
    savings,
    isFullCycle
  };
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
}

export function getMonthsOwedList(startMonth: number, endMonth: number): string[] {
  const months = [];
  for (let i = startMonth; i <= endMonth; i++) {
    months.push(getMonthName(i));
  }
  return months;
}