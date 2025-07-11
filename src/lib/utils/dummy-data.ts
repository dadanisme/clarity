import { faker } from "@faker-js/faker";
import type { Category, Transaction } from "@/types";

// Transaction descriptions for different categories
const transactionDescriptions = {
  Salary: [
    "Monthly salary",
    "Paycheck",
    "Salary payment",
    "Monthly income",
    "Base salary",
  ],
  Freelance: [
    "Freelance project",
    "Consulting work",
    "Side project",
    "Contract work",
    "Freelance payment",
  ],
  Investment: [
    "Stock dividend",
    "Interest payment",
    "Investment return",
    "Dividend payment",
    "Portfolio gain",
  ],
  "Other Income": [
    "Bonus payment",
    "Gift money",
    "Refund",
    "Cashback",
    "Other income",
  ],
  "Food & Dining": [
    "Grocery shopping",
    "Restaurant dinner",
    "Coffee shop",
    "Takeout food",
    "Lunch at work",
    "Weekend brunch",
    "Food delivery",
  ],
  Transportation: [
    "Gas station",
    "Public transport",
    "Uber ride",
    "Car maintenance",
    "Parking fee",
    "Taxi fare",
    "Bus ticket",
  ],
  Shopping: [
    "Clothing store",
    "Online shopping",
    "Electronics",
    "Home goods",
    "Bookstore",
    "Department store",
    "Fashion outlet",
  ],
  "Bills & Utilities": [
    "Electricity bill",
    "Water bill",
    "Internet service",
    "Phone bill",
    "Gas bill",
    "Insurance premium",
    "Rent payment",
  ],
  Entertainment: [
    "Movie tickets",
    "Concert tickets",
    "Netflix subscription",
    "Spotify premium",
    "Gym membership",
    "Theme park",
    "Video games",
  ],
  Healthcare: [
    "Doctor visit",
    "Pharmacy",
    "Dental checkup",
    "Prescription",
    "Health insurance",
    "Medical supplies",
    "Eye exam",
  ],
};

// Amount ranges for different categories (in IDR)
const amountRanges = {
  Salary: { min: 5000000, max: 15000000 }, // 5M - 15M IDR
  Freelance: { min: 500000, max: 5000000 }, // 500K - 5M IDR
  Investment: { min: 100000, max: 2000000 }, // 100K - 2M IDR
  "Other Income": { min: 200000, max: 3000000 }, // 200K - 3M IDR
  "Food & Dining": { min: 15000, max: 500000 }, // 15K - 500K IDR
  Transportation: { min: 5000, max: 200000 }, // 5K - 200K IDR
  Shopping: { min: 50000, max: 2000000 }, // 50K - 2M IDR
  "Bills & Utilities": { min: 100000, max: 2000000 }, // 100K - 2M IDR
  Entertainment: { min: 25000, max: 500000 }, // 25K - 500K IDR
  Healthcare: { min: 50000, max: 1000000 }, // 50K - 1M IDR
};

// Frequency patterns for different categories
type FrequencyPattern =
  | { type: "monthly" | "quarterly"; count: number }
  | { type: "frequent" | "random"; minCount: number; maxCount: number };

const frequencyPatterns: Record<string, FrequencyPattern> = {
  Salary: { type: "monthly", count: 12 },
  Freelance: { type: "random", minCount: 3, maxCount: 8 },
  Investment: { type: "quarterly", count: 4 },
  "Other Income": { type: "random", minCount: 2, maxCount: 5 },
  "Food & Dining": { type: "frequent", minCount: 60, maxCount: 120 },
  Transportation: { type: "frequent", minCount: 40, maxCount: 80 },
  Shopping: { type: "random", minCount: 20, maxCount: 50 },
  "Bills & Utilities": { type: "monthly", count: 12 },
  Entertainment: { type: "random", minCount: 15, maxCount: 35 },
  Healthcare: { type: "random", minCount: 8, maxCount: 20 },
};

// Helper function to generate a random date within a specific month (respecting today's date)
function generateRandomDateInMonth(
  startDate: Date,
  endDate: Date,
  targetMonth: number,
  targetYear: number
): Date | null {
  const monthStart = new Date(targetYear, targetMonth, 1);
  const monthEnd = new Date(targetYear, targetMonth + 1, 0);

  // Adjust start and end to respect the overall date range
  const effectiveStart = monthStart > startDate ? monthStart : startDate;
  const effectiveEnd = monthEnd < endDate ? monthEnd : endDate;

  // If the month is completely in the future, return null
  if (effectiveStart > endDate) {
    return null;
  }

  const daysInMonth = effectiveEnd.getDate();
  const startDay = effectiveStart.getDate();
  const day = faker.number.int({ min: startDay, max: daysInMonth });
  return new Date(targetYear, targetMonth, day);
}

// Helper function to generate a random date within a specific quarter (respecting today's date)
function generateRandomDateInQuarter(
  startDate: Date,
  endDate: Date,
  quarter: number,
  year: number
): Date | null {
  const startMonth = quarter * 3;
  const month = startMonth + faker.number.int({ min: 0, max: 2 });
  return generateRandomDateInMonth(startDate, endDate, month, year);
}

// Helper function to get the date range (1 year ago to today)
function getDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    startDate: oneYearAgo,
    endDate: today,
  };
}

export function generateDummyTransactions(
  categories: Category[]
): Omit<Transaction, "id" | "createdAt" | "updatedAt">[] {
  const transactions: Omit<Transaction, "id" | "createdAt" | "updatedAt">[] =
    [];
  const { startDate, endDate } = getDateRange();

  // Group categories by type
  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  // Generate transactions for each category
  [...incomeCategories, ...expenseCategories].forEach((category) => {
    const categoryName = category.name;
    const descriptions = transactionDescriptions[
      categoryName as keyof typeof transactionDescriptions
    ] || ["Transaction"];
    const amountRange = amountRanges[
      categoryName as keyof typeof amountRanges
    ] || { min: 10, max: 100 };
    const frequency = frequencyPatterns[
      categoryName as keyof typeof frequencyPatterns
    ] || { type: "random", minCount: 5, maxCount: 15 };

    let transactionCount: number;

    // Determine number of transactions based on frequency pattern
    switch (frequency.type) {
      case "monthly":
        transactionCount = frequency.count;
        break;
      case "quarterly":
        transactionCount = frequency.count;
        break;
      case "frequent":
        transactionCount = faker.number.int({
          min: frequency.minCount,
          max: frequency.maxCount,
        });
        break;
      case "random":
      default:
        transactionCount = faker.number.int({
          min: frequency.minCount,
          max: frequency.maxCount,
        });
        break;
    }

    // Generate transactions for this category
    for (let i = 0; i < transactionCount; i++) {
      let date: Date;

      // Generate date based on frequency pattern
      const currentDate = new Date();

      switch (frequency.type) {
        case "monthly":
          // Monthly transactions - one per month, but only for months in the past
          const monthsBack = 11 - i; // Start from 11 months ago, going forward
          const targetDate = new Date();
          targetDate.setMonth(currentDate.getMonth() - monthsBack);

          if (targetDate >= startDate) {
            const generatedDate = generateRandomDateInMonth(
              startDate,
              endDate,
              targetDate.getMonth(),
              targetDate.getFullYear()
            );
            if (generatedDate) {
              date = generatedDate;
            } else {
              continue;
            }
          } else {
            // Skip this transaction if the month is too far in the past
            continue;
          }
          break;
        case "quarterly":
          // Quarterly transactions - one per quarter, but only for quarters in the past
          const quartersBack = 3 - i; // Start from 3 quarters ago, going forward
          const targetQuarterDate = new Date();
          targetQuarterDate.setMonth(currentDate.getMonth() - quartersBack * 3);

          if (targetQuarterDate >= startDate) {
            const quarter = Math.floor(targetQuarterDate.getMonth() / 3);
            const generatedDate = generateRandomDateInQuarter(
              startDate,
              endDate,
              quarter,
              targetQuarterDate.getFullYear()
            );
            if (generatedDate) {
              date = generatedDate;
            } else {
              continue;
            }
          } else {
            // Skip this transaction if the quarter is too far in the past
            continue;
          }
          break;
        case "frequent":
        case "random":
        default:
          // Random dates throughout the past year
          date = faker.date.between({
            from: startDate,
            to: endDate,
          });
          break;
      }

      // Generate amount with some variation
      const baseAmount = faker.number.float({
        min: amountRange.min,
        max: amountRange.max,
        fractionDigits: 2,
      });

      // Add some randomness to make amounts more realistic
      const variation = faker.number.float({
        min: 0.8,
        max: 1.2,
        fractionDigits: 2,
      });
      const amount = Math.round(baseAmount * variation * 100) / 100;

      // Select random description
      const description = faker.helpers.arrayElement(descriptions);

      transactions.push({
        amount,
        type: category.type,
        categoryId: category.id,
        description,
        date,
      });
    }
  });

  // Sort by date (newest first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateDummyTransactionsForCurrentYear(
  categories: Category[]
): Omit<Transaction, "id" | "createdAt" | "updatedAt">[] {
  return generateDummyTransactions(categories);
}
