"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface SmartInsightBubbleProps {
  expenses: number;
  previousExpenses: number;
}

export function SmartInsightBubble({
  expenses,
  previousExpenses,
}: SmartInsightBubbleProps) {
  const getSmartInsight = () => {
    if (expenses === 0)
      return "Start tracking your expenses to see insights here.";

    if (previousExpenses === 0) {
      return "This is your first month of tracking. Keep it up!";
    }

    const changePercent =
      ((expenses - previousExpenses) / previousExpenses) * 100;

    if (Math.abs(changePercent) < 5) {
      return "Your spending is consistent with last month.";
    } else if (changePercent > 0) {
      return `You spent ${Math.round(changePercent)}% more than last month.`;
    } else {
      return `Great! You spent ${Math.round(
        Math.abs(changePercent)
      )}% less than last month.`;
    }
  };

  return (
    <Card className="rounded-2xl bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-primary font-medium">
              {getSmartInsight()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
